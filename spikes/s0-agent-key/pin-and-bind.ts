// S0 tx 2 + tx 3, then the gateway's on-chain L1 check.
//  tx 2: CIS-8004 setAgentURI pins the card URL + SHA-256 (fetched from the public URL).
//  tx 3: CIS-8 registerExternalKey binds the agent's EVM key to company A.
// Usage: pnpm pin-and-bind <tokenId> [--agent watcher] [--submit]
import { createHash } from 'node:crypto';
import { privateKeyToAccount } from 'viem/accounts';
import {
  RegistryMcp, CCD_NETWORK, loadAgentKey, fromHex,
  AGENT_KEY_NAMESPACE, AGENT_KEY_TYPE, AGENT_PROOF_SCHEME,
  paramsHash, newRequestId, signRequest, CCD_TESTNET_CAIP2,
} from '@mandate-gate/core';
import { RegistryAgentVerifier } from '@mandate-gate/gateway/agents';
import { AccountAddress } from '@concordium/web-sdk';
import { describe, submitUpdate, loadAccount, type McpUpdatePayload } from './chain.js';
import { profileFromArgs } from './profiles.js';
const profile = profileFromArgs();
const CARD_URL = profile.url;

const tokenId = process.argv[2];
const submit = process.argv.includes('--submit');
if (!tokenId) { console.error('usage: pnpm pin-and-bind <tokenId> [--submit]'); process.exit(1); }
const owner = AccountAddress.toBase58(loadAccount('company-A.export').address);
const mcp = new RegistryMcp(); await mcp.init();

// tx 2: pin what is actually served.
const served = new Uint8Array(await (await fetch(CARD_URL)).arrayBuffer());
const cardSha = createHash('sha256').update(served).digest('hex');
const pin: McpUpdatePayload = await mcp.call('build_set_agent_uri', { network: CCD_NETWORK, token_id: tokenId, agent_uri: CARD_URL, metadata_hash_hex: cardSha, sender: owner });
console.log('tx 2:', describe(pin), '| card sha256', cardSha);

// tx 3: CIS-8 binding of the agent key.
const key = loadAgentKey(profile.keyName);
const pub = key.publicKey.replace(/^0x/, '');
const canon = await mcp.call('build_cis8_canonical_bytes', {
  network: CCD_NETWORK, concordium_account: owner, external_namespace: AGENT_KEY_NAMESPACE,
  external_key_namespace: AGENT_KEY_NAMESPACE, external_key_type: AGENT_KEY_TYPE, external_public_key_hex: pub, proof_scheme: AGENT_PROOF_SCHEME,
});
const bytes = fromHex(canon.canonical_bytes_hex ?? canon.bytes_hex ?? canon.canonical_bytes ?? canon.hex);
const signature = await privateKeyToAccount(key.privateKey).signMessage({ message: { raw: bytes } });
const bind: McpUpdatePayload = await mcp.call('build_cis8_register', {
  network: CCD_NETWORK, sender: owner,
  external_key: { namespace: AGENT_KEY_NAMESPACE, key_type: AGENT_KEY_TYPE, public_key_hex: pub },
  proof: { scheme: AGENT_PROOF_SCHEME, signature_hex: signature.replace(/^0x/, '') },
  metadata: [{ key: 'role', value: profile.role }, { key: 'agent_token_id', value: tokenId }],
});
console.log('tx 3:', describe(bind), '| key', key.address, AGENT_KEY_NAMESPACE);

if (!submit) { console.log('dry run; pass --submit to send both'); process.exit(0); }
console.log('tx 2 result:', JSON.stringify(await submitUpdate(pin, 'company-A.export')));
console.log('tx 3 result:', JSON.stringify(await submitUpdate(bind, 'company-A.export')));

// Gateway L1 check, as the customer would run it.
const now = Math.floor(Date.now() / 1000);
const signed = await signRequest({
  v: 1, audience: 'mgate:customer-b',
  agent: { network: CCD_TESTNET_CAIP2, registry: { index: '12802', subindex: '0' }, tokenId, key: { namespace: AGENT_KEY_NAMESPACE, keyType: AGENT_KEY_TYPE, address: key.address } },
  workOrderHash: null, action: 'logs.read', resource: 'svc:payments', paramsHash: paramsHash({ service: 'payments' }), requestId: newRequestId(), issuedAt: now, expiresAt: now + 30,
}, key.privateKey);
console.log('L1 check:', JSON.stringify(await new RegistryAgentVerifier(new Set([owner])).verify(signed, { fresh: true })));
