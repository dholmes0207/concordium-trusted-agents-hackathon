import { createHash } from 'node:crypto';
import { hashMessage, recoverPublicKey, type Hex } from 'viem';
import {
  RegistryMcp, CCD_NETWORK, AGENT_KEY_NAMESPACE, AGENT_KEY_TYPE, signingMessage, type SignedRequest,
} from '@mandate-gate/core';

/**
 * L1 on-chain agent checks (Workshop 6 "five checks" + CIS-8 key ownership + owner allow-list):
 *  1 trusted registry   2 active   3 same URL   4 same bytes (SHA-256 of the card we fetch)
 *  5 same owner (card vs chain)    6 the signing key is bound by CIS-8 to the agent's owner
 *  7 the owner is an account this customer has onboarded (company A)
 * Reads go through the hosted Agent Registry MCP (no keys, chain-backed); the card bytes are
 * fetched and hashed by the gateway itself.
 */
export interface AgentCheck {
  ok: boolean;
  reasons: string[];
  tokenId: string;
  owner?: string;
  agentUri?: string;
  checkedAt: number;
}

export interface AgentVerifier { verify(s: SignedRequest, opts?: { fresh?: boolean }): Promise<AgentCheck> }

export class RegistryAgentVerifier implements AgentVerifier {
  private cache = new Map<string, AgentCheck>();
  constructor(
    private ownerAllowList: Set<string>,
    private mcp = new RegistryMcp(),
    private cacheSeconds = 60,
    private fetchFn: typeof fetch = fetch,
  ) {}
  private ready?: Promise<void>;

  async verify(s: SignedRequest, opts: { fresh?: boolean } = {}): Promise<AgentCheck> {
    const r = s.request;
    // Recover the full public key from the request signature (needed for the CIS-8 lookup).
    const pub = (await recoverPublicKey({ hash: hashMessage(signingMessage(r)), signature: s.signature as Hex })).replace(/^0x/, '');
    const key = `${r.agent.tokenId}|${pub}`;
    const hit = this.cache.get(key);
    if (!opts.fresh && hit && Date.now() - hit.checkedAt < this.cacheSeconds * 1000) return hit;

    this.ready ??= this.mcp.init();
    await this.ready;
    const reasons: string[] = [];
    const agent = await this.mcp.call('agent_of', { token_id: r.agent.tokenId, network: CCD_NETWORK });
    if (!agent) return this.store(key, { ok: false, reasons: ['agent_not_found'], tokenId: r.agent.tokenId, checkedAt: Date.now() });

    if (agent.status !== 'Active') reasons.push('agent_not_active');
    const badge = agent.token_address ? await this.mcp.call('check_badge', { id: agent.token_address, network: CCD_NETWORK }) : null;
    const verdict = badge?.agents?.[0] ?? badge;
    if (!verdict?.checks?.contracts_match) reasons.push('untrusted_registry');
    if (!verdict?.checks?.owner_matches) reasons.push('card_owner_mismatch');
    if (!verdict?.checks?.token_address_matches) reasons.push('card_token_mismatch');

    // Same URL + same bytes, computed here rather than trusted from the service.
    if (!agent.agent_uri || !agent.metadata_hash_hex) reasons.push('card_not_pinned');
    else {
      try {
        const body = new Uint8Array(await (await this.fetchFn(agent.agent_uri)).arrayBuffer());
        const h = createHash('sha256').update(body).digest('hex');
        if (h !== String(agent.metadata_hash_hex).toLowerCase()) reasons.push('card_hash_mismatch');
      } catch { reasons.push('card_unreachable'); }
    }

    // CIS-8: the key that signed this request is bound to the agent's owner.
    const reg = await this.mcp.call('owner_of_key', {
      external_key: { namespace: AGENT_KEY_NAMESPACE, key_type: AGENT_KEY_TYPE, public_key_hex: pub }, network: CCD_NETWORK,
    });
    const keyOwner = reg?.account ?? reg?.owner ?? reg?.concordium_account ?? null;
    if (!keyOwner) reasons.push('key_not_bound');
    else if (keyOwner !== agent.owner_account) reasons.push('key_owner_differs_from_agent_owner');

    if (!this.ownerAllowList.has(agent.owner_account)) reasons.push('owner_not_onboarded');

    return this.store(key, { ok: reasons.length === 0, reasons, tokenId: r.agent.tokenId, owner: agent.owner_account, agentUri: agent.agent_uri, checkedAt: Date.now() });
  }

  private store(k: string, c: AgentCheck) { this.cache.set(k, c); return c; }
}
