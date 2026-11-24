// Spike S3a: recompute the VRA anchor hash of a Verify & Access V1 request
// from the context and claims, and compare it with the hash registered on chain.
// Usage: node recompute-anchor.mjs <anchorTxHash> <nonceHex> <connectionId> <resourceId>
// Read-only: queries testnet, sends nothing, needs no keys.
import { ConcordiumGRPCNodeClient, credentials } from '@concordium/web-sdk/nodejs';
import { VerificationRequestV1, IdentityProviderDID, TransactionHash } from '@concordium/web-sdk';

const [txHash, nonceHex, connectionId, resourceId] = process.argv.slice(2);
if (!resourceId) {
  console.error('usage: node recompute-anchor.mjs <anchorTxHash> <nonceHex> <connectionId> <resourceId>');
  process.exit(1);
}

// Claims used in the test on 24/11: account credential, dob in range, issuer = Concordium testnet IP (idp 0).
const claims = [{
  type: 'identity',
  source: ['accountCredential'],
  issuers: [IdentityProviderDID.fromJSON('did:ccd:testnet:idp:0')],
  statements: [{ type: 'AttributeInRange', attributeTag: 'dob', lower: '18000101', upper: '20081125' }],
}];

const hashFor = (rid) => Buffer.from(VerificationRequestV1.computeAnchorHash(
  VerificationRequestV1.createSimpleContext(new Uint8Array(Buffer.from(nonceHex, 'hex')), connectionId, rid),
  claims,
)).toString('hex');

const client = new ConcordiumGRPCNodeClient('grpc.testnet.concordium.com', 20000, credentials.createSsl());
const status = await client.getBlockItemStatus(TransactionHash.fromHexString(txHash));
const summary = status.outcome?.summary;
if (status.status !== 'finalized' || summary?.transactionType !== 'registerData') {
  console.error('anchor transaction is not a finalized registerData transaction');
  process.exit(2);
}
const anchor = VerificationRequestV1.decodeAnchor(Buffer.from(summary.dataRegistered.data, 'hex'));
const onChain = Buffer.from(anchor.hash).toString('hex');

console.log('anchor block      ', status.outcome.blockHash.toString?.() ?? status.outcome.blockHash);
console.log('anchor type       ', anchor.type, 'v' + anchor.version);
console.log('on-chain hash     ', onChain);
console.log('recomputed hash   ', hashFor(resourceId), hashFor(resourceId) === onChain ? 'MATCH' : 'MISMATCH');
console.log('other ResourceID  ', hashFor(resourceId + ':tampered'), '(must differ)');
