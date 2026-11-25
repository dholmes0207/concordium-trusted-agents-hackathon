// Verifies a gateway's audit log against its on-chain anchors (L4), read only, no keys.
//   pnpm --filter @mandate-gate/gateway verify-audit [dataDir] [--gateway <account>]
// 1. The hash chain in audit.jsonl is intact (each record hashes its predecessor).
// 2. Every finalized entry in anchors.jsonl is a finalized RegisterData transaction on testnet,
//    from the gateway account, whose MGATE-AUD payload equals the record hash at that seq.
import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { TransactionHash } from '@concordium/web-sdk';
import { verifyAuditFile, decodeAnchor, toHex, grpc } from '@mandate-gate/core';

const args = process.argv.slice(2);
const dir = resolve(args.find((a) => !a.startsWith('--')) ?? '.data/gateway');
const gi = args.indexOf('--gateway');
const gatewayAccount = gi >= 0 ? args[gi + 1] : undefined;

const auditFile = join(dir, 'audit.jsonl');
const chain = verifyAuditFile(auditFile);
console.log(`audit chain : ${chain.ok ? 'intact' : `BROKEN at seq ${chain.brokenAt}`} (${chain.records} records)`);
const recs = readFileSync(auditFile, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l) as { seq: number; hash: string });

const anchorsFile = join(dir, 'anchors.jsonl');
const anchors = existsSync(anchorsFile)
  ? readFileSync(anchorsFile, 'utf8').split('\n').filter((l) => l.trim()).map((l) => JSON.parse(l)).filter((e) => e.status === 'finalized')
  : [];
let ok = chain.ok, covered = -1;
const client = grpc();
for (const e of anchors) {
  const st = await client.getBlockItemStatus(TransactionHash.fromHexString(e.txHash));
  const s = st.status === 'finalized' ? (st.outcome.summary as { transactionType?: string; sender?: { address: string }; dataRegistered?: { data: string } }) : undefined;
  let verdict = 'not finalized';
  if (s?.transactionType === 'registerData' && s.dataRegistered) {
    const a = decodeAnchor(new Uint8Array(Buffer.from(s.dataRegistered.data, 'hex')));
    const fromGw = !gatewayAccount || s.sender?.address.toString() === gatewayAccount;
    const match = a.type === 'MGATE-AUD' && a.seq === e.seq && toHex(a.hash) === recs[e.seq]?.hash;
    verdict = match && fromGw ? 'MATCH' : !fromGw ? 'wrong sender' : 'MISMATCH';
    if (match && fromGw) covered = Math.max(covered, e.seq);
  }
  if (verdict !== 'MATCH') ok = false;
  console.log(`anchor seq ${String(e.seq).padStart(4)} : ${verdict}  https://ccdexplorer.io/testnet/transaction/${e.txHash}`);
}
console.log(`anchored    : records 0..${covered} covered on chain; ${recs.length - 1 - covered} newer record(s) not anchored yet`);
console.log(ok ? 'RESULT: OK' : 'RESULT: FAILED');
process.exit(ok ? 0 : 1);
