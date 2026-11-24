import { z } from 'zod';
import { taggedHash, toHex } from './canonical.js';

/**
 * L2 work order ("mandate"): company A authorises one agent to perform a scoped set of
 * actions at one customer gateway for a limited time. A anchors `woHash` on chain with a
 * MGATE-WO RegisterData anchor and revokes it with MGATE-WOREV.
 */
export const WorkOrderSchema = z.object({
  v: z.literal(1),
  id: z.string().regex(/^wo_[A-Za-z0-9_-]{4,64}$/),
  issuer: z.object({ network: z.string(), account: z.string().min(40).max(60) }),
  audience: z.string().min(1).max(128),
  agent: z.object({ tokenId: z.string().regex(/^\d+$/), keyAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/) }),
  scope: z.object({
    actions: z.array(z.object({
      action: z.string().min(1).max(64),
      resources: z.array(z.string().min(1).max(128)).min(1).max(32),
      approval: z.enum(['none', 'required']),
      maxPerHour: z.number().int().min(1).max(10_000).optional(),
    })).min(1).max(32),
  }),
  approval: z.object({
    scheme: z.literal('mgate/approver/v1'),
    approverCommitment: z.string().regex(/^[0-9a-f]{64}$/),
  }).optional(),
  budget: z.object({ maxSpendMicroCcd: z.string().regex(/^\d+$/) }).optional(),
  notBefore: z.number().int(),
  expiresAt: z.number().int(),
  nonce: z.string().regex(/^[0-9a-f]{32,64}$/),
}).strict();

export type WorkOrder = z.infer<typeof WorkOrderSchema>;

export const WORK_ORDER_TAG = 'MGATE/v1/work-order';
export const workOrderHashBytes = (wo: WorkOrder) => taggedHash(WORK_ORDER_TAG, wo);
export const workOrderHash = (wo: WorkOrder) => toHex(workOrderHashBytes(wo));

/** `*` matches any run of characters within the resource string. */
export function resourceMatches(pattern: string, resource: string): boolean {
  const re = new RegExp('^' + pattern.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
  return re.test(resource);
}

export type ScopeResult =
  | { ok: true; approval: 'none' | 'required'; maxPerHour?: number }
  | { ok: false; reason: 'out_of_scope' | 'not_yet_valid' | 'expired' | 'wrong_audience' | 'wrong_agent' };

/** Pure checks of one request against a work order (V3, without the chain part). */
export function checkScope(
  wo: WorkOrder,
  req: { audience: string; tokenId: string; keyAddress: string; action: string; resource: string },
  now = Math.floor(Date.now() / 1000),
): ScopeResult {
  if (wo.audience !== req.audience) return { ok: false, reason: 'wrong_audience' };
  if (wo.agent.tokenId !== req.tokenId || wo.agent.keyAddress.toLowerCase() !== req.keyAddress.toLowerCase()) {
    return { ok: false, reason: 'wrong_agent' };
  }
  if (now < wo.notBefore) return { ok: false, reason: 'not_yet_valid' };
  if (now >= wo.expiresAt) return { ok: false, reason: 'expired' };
  const entry = wo.scope.actions.find((a) => a.action === req.action && a.resources.some((p) => resourceMatches(p, req.resource)));
  if (!entry) return { ok: false, reason: 'out_of_scope' };
  return { ok: true, approval: entry.approval, maxPerHour: entry.maxPerHour };
}
