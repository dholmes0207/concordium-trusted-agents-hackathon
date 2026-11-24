import { randomBytes } from 'node:crypto';
import { recoverMessageAddress, type Hex } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { canonicalJson, sha256, toHex } from './canonical.js';

/**
 * L1 request envelope. Every tool call the agent makes reaches the gateway wrapped in a
 * signed AgentRequest. The signature uses the agent's EVM key (decision D2) with an
 * EIP-191 personal-sign over a domain-separated message, so it can never be replayed
 * as a CIS-8 registration proof (those use the `CIS-8/v1/canonical` prefix).
 */
export const REQUEST_DOMAIN = 'MGATE/v1/request';
export const MAX_TTL_SECONDS = 60;
export const MAX_CLOCK_SKEW_SECONDS = 5;

export interface AgentRef {
  network: string; // CAIP-2 of the Concordium network
  registry: { index: string; subindex: string }; // CIS-8004 contract
  tokenId: string; // agent token id in the registry
  key: { namespace: string; keyType: string; address: string }; // CIS-8 bound key
}

export interface AgentRequest {
  v: 1;
  audience: string; // gateway identifier, e.g. "mgate:customer-b"
  agent: AgentRef;
  workOrderHash: string | null; // hex sha256 of the work order (L2), null until L2 exists
  action: string; // e.g. "logs.read"
  resource: string; // e.g. "svc:payments"
  paramsHash: string; // hex sha256 of canonical params
  requestId: string; // 128-bit random hex
  issuedAt: number; // unix seconds
  expiresAt: number; // unix seconds
  agentRuntime?: { model?: string; version?: string }; // self-declared, logged only
}

export interface SignedRequest {
  request: AgentRequest;
  signature: Hex;
}

export const paramsHash = (params: unknown) => toHex(sha256(canonicalJson(params ?? {})));
export const requestHash = (r: AgentRequest) => toHex(sha256(canonicalJson(r)));
export const signingMessage = (r: AgentRequest) => `${REQUEST_DOMAIN}\n${canonicalJson(r)}`;
export const newRequestId = () => randomBytes(16).toString('hex');

export async function signRequest(r: AgentRequest, privateKey: Hex): Promise<SignedRequest> {
  const acct = privateKeyToAccount(privateKey);
  if (acct.address.toLowerCase() !== r.agent.key.address.toLowerCase()) {
    throw new Error('private key does not match agent.key.address');
  }
  const signature = await acct.signMessage({ message: signingMessage(r) });
  return { request: r, signature };
}

export type EnvelopeFailure =
  | 'bad_version' | 'bad_audience' | 'not_yet_valid' | 'expired' | 'ttl_too_long'
  | 'bad_request_id' | 'bad_signature' | 'signer_mismatch';

export interface VerifyOptions {
  audience: string;
  now?: number; // unix seconds
  params?: unknown; // if given, must match paramsHash
}

/** Stateless checks: version, audience, time window, params binding, signature. */
export async function verifyEnvelope(
  s: SignedRequest,
  opt: VerifyOptions,
): Promise<{ ok: true } | { ok: false; reason: EnvelopeFailure | 'params_mismatch' }> {
  const r = s.request;
  const now = opt.now ?? Math.floor(Date.now() / 1000);
  if (r.v !== 1) return { ok: false, reason: 'bad_version' };
  if (r.audience !== opt.audience) return { ok: false, reason: 'bad_audience' };
  if (!/^[0-9a-f]{32}$/.test(r.requestId)) return { ok: false, reason: 'bad_request_id' };
  if (r.expiresAt - r.issuedAt > MAX_TTL_SECONDS) return { ok: false, reason: 'ttl_too_long' };
  if (r.issuedAt > now + MAX_CLOCK_SKEW_SECONDS) return { ok: false, reason: 'not_yet_valid' };
  if (now > r.expiresAt + MAX_CLOCK_SKEW_SECONDS) return { ok: false, reason: 'expired' };
  if (opt.params !== undefined && paramsHash(opt.params) !== r.paramsHash) {
    return { ok: false, reason: 'params_mismatch' };
  }
  let signer: string;
  try {
    signer = await recoverMessageAddress({ message: signingMessage(r), signature: s.signature });
  } catch {
    return { ok: false, reason: 'bad_signature' };
  }
  if (signer.toLowerCase() !== r.agent.key.address.toLowerCase()) return { ok: false, reason: 'signer_mismatch' };
  return { ok: true };
}
