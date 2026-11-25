import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { fromHex, type AnchorResult } from '@mandate-gate/core';
import type { AuditLog } from '@mandate-gate/core';

/**
 * L4 anchoring. The gateway's own account (customer B) puts the audit head hash on chain as a
 * MGATE-AUD RegisterData anchor `{hash: head, seq}`. One anchor covers every record before it,
 * because each record contains the hash of its predecessor. Sends are serialised (one nonce at a
 * time) and recorded in `anchors.jsonl` with their status, so a restart resumes where it stopped.
 */
export type AnchorSender = (anchor: { type: 'MGATE-AUD'; version: 1; hash: Uint8Array; seq: number }) => Promise<AnchorResult>;

export interface AnchorEntry { seq: number; head: string; status: 'submitted' | 'finalized' | 'failed'; txHash?: string; error?: string; at: string }

export class AuditAnchorer {
  private queue: Promise<unknown> = Promise.resolve();
  private last?: AnchorEntry;

  constructor(private audit: AuditLog, private send: AnchorSender, private file: string) {
    if (existsSync(file)) {
      const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
      for (const l of lines) { const e = JSON.parse(l) as AnchorEntry; if (e.status === 'finalized') this.last = e; }
    }
  }

  /** Last finalized anchor (seq and transaction). */
  get lastFinalized(): AnchorEntry | undefined { return this.last; }

  /**
   * Anchors the current head if it is not anchored yet. Resolves with the finalized entry, or
   * rejects if the anchor could not be finalized (callers that require it must fail closed).
   */
  anchorNow(): Promise<AnchorEntry> {
    const run = async () => {
      const head = this.audit.headHash;
      const seq = this.audit.lastSeq;
      if (seq < 0) throw new Error('nothing to anchor');
      if (this.last && this.last.seq >= seq) return this.last;
      const base = { seq, head, at: new Date().toISOString() };
      try {
        const r = await this.send({ type: 'MGATE-AUD', version: 1, hash: fromHex(head), seq });
        const e: AnchorEntry = { ...base, status: 'finalized', txHash: r.txHash };
        appendFileSync(this.file, JSON.stringify(e) + '\n');
        this.last = e;
        return e;
      } catch (err) {
        const e: AnchorEntry = { ...base, status: 'failed', error: (err as Error).message.slice(0, 200) };
        appendFileSync(this.file, JSON.stringify(e) + '\n');
        throw err;
      }
    };
    const p = this.queue.then(run, run);
    this.queue = p.catch(() => undefined);
    return p;
  }

  /** Anchors periodically when there are new records. Returns a stop function. */
  startTimer(intervalSeconds: number): () => void {
    const t = setInterval(() => {
      if (this.audit.lastSeq > (this.last?.seq ?? -1)) this.anchorNow().catch(() => undefined);
    }, intervalSeconds * 1000);
    t.unref();
    return () => clearInterval(t);
  }
}
