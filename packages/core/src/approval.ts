import { randomBytes } from 'node:crypto';
import { taggedHash, toHex, sha256, canonicalJson } from './canonical.js';

/**
 * L3 approval digest `D`: binds a human approval to exactly one request.
 * D goes into the Verify & Access V1 `ResourceID` (bound into the VRA anchor, see spike S3a);
 * the human-readable text is generated from the same fields with a fixed template.
 */
export interface ApprovalSubject {
  audience: string;
  agentTokenId: string;
  workOrderHash: string;
  requestHash: string;
  action: string;
  resource: string;
  paramsHash: string;
  nonce: string; // 32 hex bytes from the gateway
  expiresAt: number;
}

export const APPROVAL_TAG = 'MGATE/v1/approval';
export const approvalDigest = (s: ApprovalSubject) => toHex(taggedHash(APPROVAL_TAG, s));
export const newApprovalNonce = () => randomBytes(32).toString('hex');

/** Fixed template: anyone holding the fields can rebuild exactly this sentence. */
export function consentText(s: ApprovalSubject, params: Record<string, unknown>): string {
  const detail = Object.entries(params).map(([k, v]) => `${k}=${String(v)}`).join(', ');
  return `Approve ${s.action} on ${s.resource} (${detail}) requested by agent #${s.agentTokenId} under work order ${s.workOrderHash.slice(0, 12)}, for ${s.audience}. Ref ${'D:' + approvalDigest(s).slice(0, 16)}.`;
}

/**
 * Commitment to the approver named in a work order (AB3). For the Browser Wallet route the
 * identifier is the account credential DID from the presentation; for the ID App route it is
 * the revealed first and last name. The salt keeps the identity hidden until opened.
 */
export function approverCommitment(ids: Array<{ type: 'account-cred' | 'id-name'; value: string }>, saltHex: string): string {
  return toHex(sha256(`mgate/approver/v1\n${canonicalJson({ ids })}\n${saltHex}`));
}
