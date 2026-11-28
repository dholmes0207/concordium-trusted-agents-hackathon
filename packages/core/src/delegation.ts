import { z } from 'zod';
import { recoverMessageAddress, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { randomBytes } from 'node:crypto';
import { taggedHash, toHex } from './canonical.js';
import { resourceMatches, ScopeSchema, type WorkOrder } from './workorder.js';

/**
 * Multi-level delegation. An agent holding a work order (or a delegation) hands a narrower part of
 * it to another registered agent by signing a delegation with its own CIS-8-bound key. Nothing new
 * is anchored: the chain hangs off the anchored root work order, every link is signed, and each link
 * may only narrow what it received (actions, resources, approval, rate, time, budget, depth).
 * Revoking or suspending any link stops everything below it.
 */
const agentRef = z.object({ tokenId: z.string().regex(/^\d+$/), keyAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/) });

export const DelegationSchema = z.object({
  v: z.literal(1),
  kind: z.literal('delegation'),
  id: z.string().regex(/^dl_[A-Za-z0-9_-]{4,64}$/),
  parent: z.string().regex(/^[0-9a-f]{64}$/), // hash of the work order or delegation it narrows
  depth: z.number().int().min(1).max(4),
  audience: z.string().min(1).max(128),
  delegator: agentRef,
  agent: agentRef,
  scope: ScopeSchema,
  budget: z.object({ maxSpendMicroCcd: z.string().regex(/^\d+$/) }).optional(),
  purpose: z.string().max(200).optional(),
  notBefore: z.number().int(),
  expiresAt: z.number().int(),
  nonce: z.string().regex(/^[0-9a-f]{32,64}$/),
}).strict();
export type Delegation = z.infer<typeof DelegationSchema>;

export const SignedDelegationSchema = z.object({
  delegation: DelegationSchema,
  signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/),
}).strict();
export type SignedDelegation = z.infer<typeof SignedDelegationSchema>;

export const DELEGATION_TAG = 'MGATE/v1/delegation';
export const delegationHash = (d: Delegation) => toHex(taggedHash(DELEGATION_TAG, d));
const signingText = (d: Delegation) => `${DELEGATION_TAG}\n${delegationHash(d)}`;

export async function signDelegation(d: Delegation, delegatorKey: Hex): Promise<SignedDelegation> {
  const acct = privateKeyToAccount(delegatorKey);
  if (acct.address.toLowerCase() !== d.delegator.keyAddress.toLowerCase()) throw new Error('key does not match delegator');
  return { delegation: d, signature: await acct.signMessage({ message: signingText(d) }) };
}

export async function verifyDelegationSignature(sd: SignedDelegation): Promise<boolean> {
  try {
    const addr = await recoverMessageAddress({ message: signingText(sd.delegation), signature: sd.signature as Hex });
    return addr.toLowerCase() === sd.delegation.delegator.keyAddress.toLowerCase();
  } catch { return false; }
}

export const newDelegationNonce = () => randomBytes(16).toString('hex');

/** What a link of the chain grants: the root work order or a delegation. */
export type Grant = Pick<WorkOrder, 'audience' | 'agent' | 'scope' | 'budget' | 'notBefore' | 'expiresAt'>;

/** True if every resource matched by `child` is also matched by `parent` (conservative for wildcards). */
export function patternCovers(parent: string, child: string): boolean {
  if (!child.includes('*')) return resourceMatches(parent, child);
  if (parent === child) return true;
  const prefix = parent.slice(0, -1);
  return parent.endsWith('*') && !prefix.includes('*') && child.startsWith(prefix);
}

export type AttenuationReason =
  | 'delegation_not_allowed' | 'delegation_too_deep' | 'delegation_wrong_delegator' | 'delegation_wrong_audience'
  | 'delegation_wrong_parent' | 'delegation_outlives_parent' | 'delegation_scope_wider_than_parent'
  | 'delegation_budget_exceeds_parent';

/**
 * Checks that `child` only narrows `parent`. `parentHash`/`parentDepth` locate the parent in the chain,
 * `maxDepth` comes from the root work order, `parentBudgetLeft` is what the parent can still spend
 * (null when the parent has no budget, i.e. cannot pay for anything).
 */
export function checkAttenuation(
  parent: Grant, parentHash: string, parentDepth: number, maxDepth: number | undefined,
  child: Delegation, parentBudgetLeft: bigint | null,
): { ok: true } | { ok: false; reason: AttenuationReason } {
  if (!maxDepth) return { ok: false, reason: 'delegation_not_allowed' };
  if (child.parent !== parentHash) return { ok: false, reason: 'delegation_wrong_parent' };
  if (child.depth !== parentDepth + 1 || child.depth > maxDepth) return { ok: false, reason: 'delegation_too_deep' };
  if (child.audience !== parent.audience) return { ok: false, reason: 'delegation_wrong_audience' };
  if (child.delegator.tokenId !== parent.agent.tokenId || child.delegator.keyAddress.toLowerCase() !== parent.agent.keyAddress.toLowerCase()) {
    return { ok: false, reason: 'delegation_wrong_delegator' };
  }
  if (child.expiresAt > parent.expiresAt || child.notBefore < parent.notBefore) return { ok: false, reason: 'delegation_outlives_parent' };
  for (const c of child.scope.actions) {
    const covered = parent.scope.actions.some((p) =>
      p.action === c.action
      && c.resources.every((r) => p.resources.some((pr) => patternCovers(pr, r)))
      && (p.approval === 'none' || c.approval === 'required')
      && (p.maxPerHour === undefined || (c.maxPerHour !== undefined && c.maxPerHour <= p.maxPerHour)));
    if (!covered) return { ok: false, reason: 'delegation_scope_wider_than_parent' };
  }
  if (child.budget) {
    if (parentBudgetLeft === null || BigInt(child.budget.maxSpendMicroCcd) > parentBudgetLeft) return { ok: false, reason: 'delegation_budget_exceeds_parent' };
  }
  return { ok: true };
}
