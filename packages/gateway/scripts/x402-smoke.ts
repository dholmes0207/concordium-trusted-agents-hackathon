// x402 on testnet without the gateway pipeline: the agent wallet signs a sponsored 0.5 CCD transfer,
// the gateway's facilitator verifies it (9 rules), co-signs as sponsor, submits and waits for finality.
//   pnpm --filter @mandate-gate/gateway exec tsx scripts/x402-smoke.ts
import { loadAccount, grpc } from '@mandate-gate/core';
import { payFor } from '@mandate-gate/agent-proxy';
import { X402Processor } from '../src/payments.js';
import { SerialQueue } from '../src/txqueue.js';

const B = '2zmbEkwHcYCMz6369NicRQmu1bpxGS33KRM2PE4QAxUfQLWch8';
const wallet = loadAccount('agent-wallet.export');
const bal = async (a: string) => Number((await grpc().getAccountInfo(loadAccount(a).address)).accountAmount.microCcdAmount) / 1e6;
const before = { wallet: await bal('agent-wallet.export'), gateway: await bal('gateway-B.export') };

const fac = new X402Processor({ priceMicroCcd: '500000', payTo: B, maxTimeoutSeconds: 540 }, 'gateway-B.export', new SerialQueue());
const req = fac.requirements();
const payment = await payFor({ gatewayUrl: '', audience: '', agentTokenId: '', agentAddress: '', privateKey: '0x', payer: { accountAddress: wallet.address, signer: wallet.signer } },
  { accepts: [req], budget: { maxMicroCcd: '10000000', spentMicroCcd: '0' } }, 0n);
if (typeof payment === 'string') throw new Error(payment);
console.log('requirements :', JSON.stringify(req));
const v = await fac.verify(payment, req);
console.log('verify       :', JSON.stringify(v));
if (!v.ok) process.exit(1);
const s = await fac.settle(payment, req);
console.log('settle       :', JSON.stringify(s));
if (s.ok) console.log('explorer     : https://ccdexplorer.io/testnet/transaction/' + s.txHash);
const again = await fac.verify(payment, req).catch((e) => ({ ok: false, reason: (e as Error).message }));
const after = { wallet: await bal('agent-wallet.export'), gateway: await bal('gateway-B.export') };
console.log('balances     :', JSON.stringify({ before, after }));
console.log('re-settle    :', JSON.stringify(await fac.settle(payment, req).catch((e) => ({ ok: false, reason: (e as Error).message }))), '(must fail: same transaction)');
void again;
process.exit(0);
