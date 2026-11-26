import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type { PaymentPayload, PaymentRequirements } from '@x402/core/types';
import { startMockOps } from '@mandate-gate/mock-ops';
import { signedCall, connectGateway, payFor, type ProxyConfig } from '@mandate-gate/agent-proxy';
import { toolByName, encodeAnchor, workOrderHashBytes, toHex, type WorkOrder } from '@mandate-gate/core';
import { Gateway } from '../src/gateway.js';
import { MandateIndex } from '../src/mandates.js';
import { ApprovalService } from '../src/approvals.js';
import type { PaymentProcessor } from '../src/payments.js';

// x402 extension with a fake facilitator: price per level-2 action, budget per work order, stop rule.
const OPS_PORT = 17431, GW_PORT = 17430, BASE = `http://127.0.0.1:${GW_PORT}`;
const ISSUER = '3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw';
const PAY_TO = '2zmbEkwHcYCMz6369NicRQmu1bpxGS33KRM2PE4QAxUfQLWch8';
const agentKey = generatePrivateKey();
const agentAddr = privateKeyToAccount(agentKey).address;
const now = Math.floor(Date.now() / 1000);

const makeWo = (budget: string | null = '10000000'): WorkOrder => ({
  v: 1, id: 'wo_x402_' + Math.random().toString(36).slice(2, 10),
  issuer: { network: 'ccd:4221332d34e1694168c2a0c0b3fd0f27', account: ISSUER },
  audience: 'mgate:customer-b', agent: { tokenId: '42', keyAddress: agentAddr },
  scope: { actions: [{ action: 'deploy.prod', resources: ['svc:payments'], approval: 'required' }] },
  ...(budget ? { budget: { maxSpendMicroCcd: budget } } : {}),
  notBefore: now - 60, expiresAt: now + 3600, nonce: 'd'.repeat(32),
});
const index = new MandateIndex(new Set([ISSUER]), 30, () => Date.now());
let height = 100n;
const anchorWo = (wo: WorkOrder) => index.ingest({ height: height++, hash: 'h' + height, events: [{
  sender: ISSUER, txHash: `tx${height}`, dataHex: toHex(encodeAnchor({ type: 'MGATE-WO', version: 1, hash: workOrderHashBytes(wo) })) }] });
const tick = setInterval(() => index.ingest({ height: height++, hash: 'h' + height, events: [] }), 200);

const REQ: PaymentRequirements = { scheme: 'exact', network: 'ccd:4221332d34e1694168c2a0c0b3fd0f27', asset: 'CCD', amount: '500000', payTo: PAY_TO, maxTimeoutSeconds: 540, extra: { feePayer: PAY_TO } };
const settled: string[] = []; let settleFails = false;
const processor: PaymentProcessor = {
  requirements: () => REQ,
  async verify(p) {
    const x = p.payload as { amount?: string; to?: string };
    if (x.amount !== REQ.amount) return { ok: false, reason: 'amount_mismatch' };
    if (x.to !== PAY_TO) return { ok: false, reason: 'recipient_mismatch' };
    return { ok: true, payer: 'agent-wallet' };
  },
  async settle(p) {
    if (settleFails) return { ok: false, reason: 'node_unreachable' };
    const id = (p.payload as { id: string }).id; settled.push(id);
    return { ok: true, payer: 'agent-wallet', txHash: 'pay_' + id };
  },
};
// A stand-in for the agent wallet's signed transfer; `id` plays the sender signature.
let n = 0;
const payment = (over: Record<string, unknown> = {}): PaymentPayload => {
  const id = `sig${n++}`;
  return { x402Version: 2, accepted: REQ, payload: { amount: '500000', to: PAY_TO, id, signedTransaction: { signatures: { sender: id } }, ...over } };
};

let ops: Server, gw: Server, dataDir: string;
const base: ProxyConfig = { gatewayUrl: `${BASE}/mcp`, audience: 'mgate:customer-b', agentTokenId: '42', agentAddress: agentAddr, privateKey: agentKey };
async function call(wo: WorkOrder, pay?: PaymentPayload) {
  const client = await connectGateway(base.gatewayUrl);
  const params = { service: 'payments', version: 'v2.2.1' };
  const res = await client.callTool({ name: 'deploy_prod', arguments: { params, auth: await signedCall({ ...base, workOrder: wo }, toolByName('deploy_prod')!, params, pay) } }, undefined, { timeout: 30_000 });
  await client.close();
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}
async function settle(action: 'approve' | 'reject') {
  for (let i = 0; i < 100; i++) {
    const list = await (await fetch(`${BASE}/approvals`)).json() as Array<{ id: string; digest: string }>;
    if (list.length) {
      const p = list[0];
      const path = action === 'approve' ? `/approvals/${p.id}/presentation` : `/approvals/${p.id}/reject`;
      await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ presentation: { resourceId: p.digest } }) });
      return;
    }
    await new Promise((r) => setTimeout(r, 30));
  }
  throw new Error('no pending approval');
}
const approvals = () => new ApprovalService({
  async createRequest(p) { return { requestJson: { resourceId: p.digest }, vraTx: 'vra' }; },
  async verifyPresentation(p, pres) { if ((pres as { resourceId?: string }).resourceId !== p.digest) throw new Error('bad'); return { credentialId: 'did:ccd:testnet:cred:aa', issuer: 'did:ccd:testnet:idp:0' }; },
}, 3);

before(async () => {
  ops = await startMockOps(OPS_PORT);
  dataDir = mkdtempSync(join(tmpdir(), 'mgate-x402-'));
  gw = await new Gateway({
    audience: 'mgate:customer-b', mockOpsUrl: `http://127.0.0.1:${OPS_PORT}`, dataDir,
    trustedAgents: [{ tokenId: '42', address: agentAddr }], mandates: { trustedIssuers: [ISSUER] },
  }, index, undefined, undefined, approvals(), processor).listen(GW_PORT);
});
after(() => { clearInterval(tick); gw.close(); ops.close(); });

test('level-2 call without payment gets the x402 requirements and the budget', async () => {
  const wo = makeWo(); anchorWo(wo);
  const r = await call(wo);
  assert.equal(r.status, 'payment_required');
  assert.deepEqual(r.accepts[0], REQ);
  assert.deepEqual(r.budget, { maxMicroCcd: '10000000', spentMicroCcd: '0' });
});

test('paid and approved: settled after approval, before execution, and recorded in the audit chain', async () => {
  const wo = makeWo(); anchorWo(wo);
  const out = call(wo, payment());
  await settle('approve');
  const r = await out;
  assert.equal(r.status, 'ok');
  const recs = readFileSync(join(dataDir, 'audit.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const i = recs.map((x: { kind: string }) => x.kind).lastIndexOf('payment');
  assert.equal(recs[i].data.amountMicroCcd, '500000');
  assert.equal(recs[i].data.spentMicroCcd, '500000');
  assert.equal(recs[i - 1].kind, 'approval');
  assert.equal(recs[i + 1].data.decision, 'allow');
});

test('rejected approval: the payment is never settled', async () => {
  const wo = makeWo(); anchorWo(wo);
  const before = settled.length;
  const out = call(wo, payment());
  await settle('reject');
  assert.equal((await out).reason, 'rejected_by_approver');
  assert.equal(settled.length, before);
});

test('wrong amount or recipient is refused before anyone is asked to approve', async () => {
  const wo = makeWo(); anchorWo(wo);
  assert.equal((await call(wo, payment({ amount: '1' }))).reason, 'payment_invalid: amount_mismatch');
  assert.equal((await call(wo, payment({ to: ISSUER }))).reason, 'payment_invalid: recipient_mismatch');
  assert.equal(((await (await fetch(`${BASE}/approvals`)).json()) as unknown[]).length, 0);
});

test('a settled payment cannot pay for a second action', async () => {
  const wo = makeWo(); anchorWo(wo);
  const p = payment();
  const out = call(wo, p); await settle('approve'); assert.equal((await out).status, 'ok');
  assert.equal((await call(wo, p)).reason, 'payment_replayed');
});

test('stop rule: the work order budget caps spending', async () => {
  const wo = makeWo('500000'); anchorWo(wo); // budget for exactly one action
  const out = call(wo, payment()); await settle('approve'); assert.equal((await out).status, 'ok');
  const r = await call(wo, payment());
  assert.equal(r.reason, 'budget_exceeded');
});

test('work order without a budget cannot pay for level-2 actions', async () => {
  const wo = makeWo(null); anchorWo(wo);
  assert.equal((await call(wo, payment())).reason, 'work_order_has_no_budget');
});

test('settlement failure: the action does not run', async () => {
  const wo = makeWo(); anchorWo(wo);
  settleFails = true;
  const out = call(wo, payment()); await settle('approve');
  const r = await out; settleFails = false;
  assert.equal(r.reason, 'payment_settle_failed: node_unreachable');
});

test('proxy stop rule: refuses to pay past the budget or its local cap', async () => {
  const payer = { accountAddress: {} as never, signer: {} as never };
  assert.equal(await payFor({ ...base, payer }, { accepts: [REQ], budget: { maxMicroCcd: '1000000', spentMicroCcd: '800000' } }, 0n), 'budget_exceeded');
  assert.equal(await payFor({ ...base, payer, maxSpendMicroCcd: 1_000_000n }, { accepts: [REQ] }, 600_000n), 'local_spend_cap_reached');
  assert.equal(await payFor(base, { accepts: [REQ] }, 0n), 'no_payer_configured');
});
