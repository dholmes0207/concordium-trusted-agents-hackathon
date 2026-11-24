// S0 step 2: prepare the CIS-8 registration that binds the agent's EVM key to the owner account.
// Read-only: builds and checks the payload, sends nothing. The owner signs the transaction later.
// Usage: pnpm cis8 <ownerConcordiumAccount> [keyName]
import { recoverMessageAddress } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import {
  RegistryMcp, loadAgentKey, CCD_NETWORK,
  AGENT_KEY_NAMESPACE, AGENT_KEY_TYPE, AGENT_PROOF_SCHEME, fromHex, toHex,
} from '@mandate-gate/core';

const owner = process.argv[2];
const keyName = process.argv[3] ?? 'agent-evm';
if (!owner) { console.error('usage: pnpm cis8 <ownerConcordiumAccount> [keyName]'); process.exit(1); }

const key = loadAgentKey(keyName);
const pubHex = key.publicKey.replace(/^0x/, '');
const mcp = new RegistryMcp();
await mcp.init();

// 1) Exact bytes the external key must sign (scheme-agnostic).
const canon = await mcp.call('build_cis8_canonical_bytes', {
  network: CCD_NETWORK,
  concordium_account: owner,
  external_namespace: AGENT_KEY_NAMESPACE,
  external_key_namespace: AGENT_KEY_NAMESPACE,
  external_key_type: AGENT_KEY_TYPE,
  external_public_key_hex: pubHex,
  proof_scheme: AGENT_PROOF_SCHEME,
});
const bytesHex: string = canon?.canonical_bytes_hex ?? canon?.bytes_hex ?? canon?.canonical_bytes ?? canon?.hex;
if (!bytesHex) { console.error('unexpected response:', JSON.stringify(canon).slice(0, 800)); process.exit(2); }
const bytes = fromHex(bytesHex);
console.log('Canonical bytes:', bytes.length, 'bytes; starts with', JSON.stringify(Buffer.from(bytes.slice(0, 24)).toString('latin1')));

// 2) ethereum-personal-sign: EIP-191 prefix + keccak256, done by viem.
const acct = privateKeyToAccount(key.privateKey);
const signature = await acct.signMessage({ message: { raw: bytes } });
const recovered = await recoverMessageAddress({ message: { raw: bytes }, signature });
if (recovered.toLowerCase() !== key.address.toLowerCase()) throw new Error('signature does not recover to the agent address');
console.log('Signature OK, recovers to', recovered);

// 3) Sign-ready CIS-8 registerExternalKey payload for the owner to sign in a wallet.
const payload = await mcp.call('build_cis8_register', {
  network: CCD_NETWORK,
  sender: owner,
  external_key: { namespace: AGENT_KEY_NAMESPACE, key_type: AGENT_KEY_TYPE, public_key_hex: pubHex },
  proof: { scheme: AGENT_PROOF_SCHEME, signature_hex: signature.replace(/^0x/, '') },
  metadata: [{ key: 'role', value: 'mandate-gate-agent' }],
});
console.log('CIS-8 register payload (to be signed by the owner):');
console.log(JSON.stringify(payload, null, 2).slice(0, 3000));
void toHex;
