// Spike S1: follow finalized blocks and report MandateGate anchors sent by a given account.
// Fail-closed demo: if no finalized block is seen for STALE_SECONDS, print that requests must be refused.
// Usage: pnpm watch <accountAddress>
import { AccountAddress } from '@concordium/web-sdk';
import { ConcordiumGRPCNodeClient, credentials } from '@concordium/web-sdk/nodejs';
import { decodeAnchor, toHex, CCD_GRPC } from '@mandate-gate/core';

const account = process.argv[2];
if (!account) { console.error('usage: pnpm watch <accountAddress>'); process.exit(1); }
const watched = AccountAddress.fromBase58(account).address;
const STALE_SECONDS = Number(process.env.STALE_SECONDS ?? 30);
const client = new ConcordiumGRPCNodeClient(CCD_GRPC.host, CCD_GRPC.port, credentials.createSsl());

let lastSeen = Date.now();
setInterval(() => {
  const age = (Date.now() - lastSeen) / 1000;
  if (age > STALE_SECONDS) console.log(`[fail-closed] no finalized block for ${age.toFixed(0)}s -> revocation_status_stale, refuse requests`);
}, 5000).unref();

console.log('watching finalized blocks for anchors from', account);
for await (const block of client.getFinalizedBlocks()) {
  lastSeen = Date.now();
  for await (const item of client.getBlockTransactionEvents(block.hash)) {
    const s = item as any;
    if (s.transactionType !== 'registerData' || s.sender?.address !== watched) continue;
    try {
      const a = decodeAnchor(new Uint8Array(Buffer.from(s.dataRegistered.data, 'hex')));
      console.log(`[${new Date().toISOString()}] height ${block.height} ${a.type} ${toHex(a.hash)}`);
    } catch { /* not a MandateGate anchor */ }
  }
}
