// S0 step 6 (read-only): run the gateway's on-chain L1 checks for an agent token id,
// with a request signed by our agent key. Before our agent and CIS-8 binding exist, this
// shows which checks fail for an existing testnet agent (e.g. 601) and our unbound key.
// Usage: pnpm verify-agent <tokenId> [ownerAllowList,comma,separated]
import { loadAgentKey, paramsHash, newRequestId, signRequest, CCD_TESTNET_CAIP2, AGENT_KEY_NAMESPACE, AGENT_KEY_TYPE } from '@mandate-gate/core';
import { RegistryAgentVerifier } from '@mandate-gate/gateway/agents';

const [tokenId, allow = ''] = process.argv.slice(2);
if (!tokenId) { console.error('usage: pnpm verify-agent <tokenId> [owners]'); process.exit(1); }
const key = loadAgentKey();
const now = Math.floor(Date.now() / 1000);
const signed = await signRequest({
  v: 1, audience: 'mgate:customer-b',
  agent: { network: CCD_TESTNET_CAIP2, registry: { index: '12802', subindex: '0' }, tokenId,
    key: { namespace: AGENT_KEY_NAMESPACE, keyType: AGENT_KEY_TYPE, address: key.address } },
  workOrderHash: null, action: 'logs.read', resource: 'svc:payments', paramsHash: paramsHash({ service: 'payments' }),
  requestId: newRequestId(), issuedAt: now, expiresAt: now + 30,
}, key.privateKey);
const v = new RegistryAgentVerifier(new Set(allow.split(',').filter(Boolean)));
console.log(JSON.stringify(await v.verify(signed), null, 2));
