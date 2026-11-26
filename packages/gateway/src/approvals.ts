import { randomBytes } from 'node:crypto';
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import {
  approvalDigest, consentText, approverCommitment, type ApprovalSubject,
} from '@mandate-gate/core';

/**
 * L3 human approval. For each held action the gateway creates a Verify & Access V1 request whose
 * ResourceID is the approval digest D (bound into the on-chain VRA anchor, see spike S3a), asks a
 * named engineer to answer it with an account-based proof from their wallet, verifies the proof
 * against the chain, checks the approver against the work order's commitment, and only then lets
 * the action run. The wallet does not display the context, so the approval page shows the action.
 */
export interface PendingApproval {
  id: string;
  digest: string;
  subject: ApprovalSubject;
  params: Record<string, unknown>;
  consent: string;
  approverCommitment?: string;
  requestJson?: unknown; // V&A V1 request, set once anchored
  vraTx?: string;
  status: 'creating' | 'pending' | 'approved' | 'rejected' | 'expired' | 'failed';
  reason?: string;
  approver?: { credentialId: string; issuer: string };
  vaaTx?: string;
  createdAt: number;
}

/** Chain side of an approval, implemented with the Concordium SDK (see verifier.ts) or faked in tests. */
export interface ApprovalBackend {
  /** Builds the V&A V1 request for this approval and anchors it (VRA). */
  createRequest(p: PendingApproval): Promise<{ requestJson: unknown; vraTx: string }>;
  /** Verifies a presentation against the request and the chain. Returns the approver's credential. */
  verifyPresentation(p: PendingApproval, presentationJson: unknown): Promise<{ credentialId: string; issuer: string; vaaTx?: string }>;
}

export class ApprovalService {
  private items = new Map<string, PendingApproval>();
  private waiters = new Map<string, Array<(p: PendingApproval) => void>>();

  /** `file`: optional JSON-lines journal, so approvals survive a gateway restart (see recover()). */
  constructor(private backend: ApprovalBackend, private holdSeconds = 300, private file?: string) {}

  private persist(p: PendingApproval) {
    if (this.file) appendFileSync(this.file, JSON.stringify(p) + '\n');
  }

  /**
   * Reloads the journal. A held call cannot outlive the gateway process (the agent's connection is
   * gone), so approvals still pending are closed as expired. Returns those, for the audit log.
   */
  recover(): PendingApproval[] {
    if (!this.file || !existsSync(this.file)) return [];
    for (const l of readFileSync(this.file, 'utf8').split('\n')) {
      if (!l.trim()) continue;
      const p = JSON.parse(l) as PendingApproval;
      this.items.set(p.id, p);
    }
    const interrupted = [...this.items.values()].filter((p) => p.status === 'pending' || p.status === 'creating');
    for (const p of interrupted) this.settle(p, 'expired', 'approval_interrupted_by_restart');
    return interrupted;
  }

  get(id: string) { return this.items.get(id); }
  list() { return [...this.items.values()].filter((p) => p.status === 'pending'); }

  async create(subject: Omit<ApprovalSubject, 'nonce' | 'expiresAt'>, params: Record<string, unknown>, approverCommitmentHex?: string): Promise<PendingApproval> {
    const full: ApprovalSubject = { ...subject, nonce: randomBytes(32).toString('hex'), expiresAt: Math.floor(Date.now() / 1000) + this.holdSeconds };
    const p: PendingApproval = {
      id: `ap_${randomBytes(8).toString('hex')}`, digest: approvalDigest(full), subject: full, params,
      consent: consentText(full, params), approverCommitment: approverCommitmentHex, status: 'creating', createdAt: Date.now(),
    };
    this.items.set(p.id, p);
    try {
      const { requestJson, vraTx } = await this.backend.createRequest(p);
      Object.assign(p, { requestJson, vraTx, status: 'pending' });
      this.persist(p);
    } catch (e) {
      this.settle(p, 'failed', `request_not_anchored: ${(e as Error).message}`);
    }
    return p;
  }

  /** Waits until the approval is settled or the hold time runs out (fail closed). */
  wait(id: string): Promise<PendingApproval> {
    const p = this.items.get(id);
    if (!p) return Promise.reject(new Error('unknown approval'));
    if (p.status !== 'pending' && p.status !== 'creating') return Promise.resolve(p);
    return new Promise((resolve) => {
      const left = Math.max(0, p.subject.expiresAt * 1000 - Date.now());
      const timer = setTimeout(() => this.settle(p, 'expired', 'approval_timeout'), left);
      const list = this.waiters.get(id) ?? [];
      list.push((done) => { clearTimeout(timer); resolve(done); });
      this.waiters.set(id, list);
    });
  }

  async submit(id: string, presentationJson: unknown, salt?: string): Promise<PendingApproval> {
    const p = this.items.get(id);
    if (!p) throw new Error('unknown approval');
    if (p.status !== 'pending') return p;
    if (Date.now() > p.subject.expiresAt * 1000) return this.settle(p, 'expired', 'approval_timeout');
    let who;
    try { who = await this.backend.verifyPresentation(p, presentationJson); }
    catch (e) { return this.settle(p, 'rejected', `presentation_invalid: ${(e as Error).message}`); }
    // AB3: the approver must be the engineer company A named in the work order.
    if (p.approverCommitment) {
      if (!salt || !/^[0-9a-f]{32,64}$/.test(salt)) return this.settle(p, 'rejected', 'approver_salt_missing');
      const c = approverCommitment([{ type: 'account-cred', value: who.credentialId }], salt);
      if (c !== p.approverCommitment) return this.settle(p, 'rejected', 'approver_not_named_in_work_order');
    }
    p.approver = { credentialId: who.credentialId, issuer: who.issuer };
    p.vaaTx = who.vaaTx;
    return this.settle(p, 'approved');
  }

  reject(id: string, reason = 'rejected_by_approver'): PendingApproval | undefined {
    const p = this.items.get(id);
    return p && p.status === 'pending' ? this.settle(p, 'rejected', reason) : p;
  }

  private settle(p: PendingApproval, status: PendingApproval['status'], reason?: string): PendingApproval {
    if (p.status === 'approved' || p.status === 'rejected' || p.status === 'expired') return p; // single use (AB4)
    p.status = status; if (reason) p.reason = reason;
    this.persist(p);
    for (const w of this.waiters.get(p.id) ?? []) w(p);
    this.waiters.delete(p.id);
    return p;
  }
}
