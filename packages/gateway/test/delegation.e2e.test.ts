import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import type { Hex } from 'viem';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import type { PaymentPayload, PaymentRequirements } from '@x402/core/types';
import { startMockOps } from '@mandate-gate/mock-ops';
import { signedCall, connectGateway, type ProxyConfig } from '@mandate-gate/agent-proxy';
import {
  toolByName, encodeAnchor, workOrderHashBytes, toHex, fromHex, signDelegation, delegationHash,
  type WorkOrder, type Delegation, type SignedDelegation,
} from '@mandate-gate/core';
import { Gateway } from '../src/gateway.js';
import { MandateIndex } from '../src/mandates.js';
import { ApprovalService } from '../src/approvals.js';
import type { PaymentProcessor } from '../src/payments.js';

// Multi-level delegation: lead agent 42 hands a narrower job to sub-agent 77 with a signed delegation.
const OPS_PORT = 17441, GW_PORT = 17440, BASE = `http://127.0.0.1:${GW_PORT}`;
const ISSUER = '3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw';
const PAY_TO = '2zmbEkwHcYCMz6369NicRQmu1bpxGS33KRM2PE4QAxUfQLWch8';
const leadKey = generatePrivateKey(), subKey = generatePrivateKey(), thirdKey = generatePrivateKey();
const lead = privateKeyToAccount(leadKey).address, sub = privateKeyToAccount(subKey).address, third = privateKeyToAccount(thirdKey).address;
const now = Math.floor(Date.now() / 1000);
let n = 0;

const makeWo = (over: Partial<WorkOrder> = {}): WorkOrder => ({
  v: 1, id: 'wo_dl_' + (n++), issuer: { network: 'ccd:4221332d34e1694168c2a0c0b3fd0f27', account: ISSUER },
  audience: 'mgate:customer-b', agent: { tokenId: '42', keyAddress: lead },
  scope: { actions: [
    { action: 'logs.read', resources: ['svc:*'], approval: 'none' },
    { action: 'service.status', resources: ['svc:*'], approval: 'none' },
    { action: 'service.restart', resources: ['svc:payments', 'svc:billing'], approval: 'none', maxPerHour: 5 },
    { action: 'deploy.prod', resources: ['svc:payments'], approval: 'required' },
  ] },
  budget: { maxSpendMicroCcd: '10000000' }, delegation: { maxDepth: 1 },
  notBefore: now - 60, expiresAt: now + 3600, nonce: 'c'.repeat(32), ...over,
});
const watcherScope: Delegation['scope'] = { actions: [
  { action: 'logs.read', resources: ['svc:payments'], approval: 'none' },
  { action: 'service.status', resources: ['svc:payments'], approval: 'none' },
  { action: 'service.restart', resources: ['svc:payments'], approval: 'none', maxPerHour: 2 },
] };
const makeDl = (parent: string, over: Partial<Delegation> = {}): Delegation => ({
  v: 1, kind: 'delegation', id: 'dl_watch_' + (n++), parent, depth: 1, audience: 'mgate:customer-b',
  delegator: { tokenId: '42', keyAddress: lead }, agent: { tokenId: '77', keyAddress: sub },
  scope: watcherScope, purpose: 'Watch payments for 30 minutes after the v2.2.1 deploy',
  notBefore: now - 30, expiresAt: now + 1800, nonce: 'd'.repeat(32), ...over,
});
const woHash = (wo: WorkOrder) => toHex(workOrderHashBytes(wo));

const index = new MandateIndex(new Set([ISSUER]), 30, () => Date.now());
let height = 100n;
const anchor = (type: 'MGATE-WO' | 'MGATE-WOREV', hashHex: string) => index.ingest({ height: height++, hash: 'h' + height, events: [{
  sender: ISSUER, txHash: `tx${height}`, dataHex: toHex(encodeAnchor({ type, version: 1, hash: fromHex(hashHex) })) }] });
const tick = setInterval(() => index.ingest({ height: height++, hash: 'h' + height, events: [] }), 200);

const REQ: PaymentRequirements = { scheme: 'exact', network: 'ccd:4221332d34e1694168c2a0c0b3fd0f27', asset: 'CCD', amount: '500000', payTo: PAY_TO, maxTimeoutSeconds: 540, extra: { feePayer: PAY_TO } };
const processor: PaymentProcessor = {
  requirements: () => REQ,
  async verify() { return { ok: true, payer: 'wallet' }; },
  async settle(p) { return { ok: true, payer: 'wallet', txHash: 'pay_' + (p.payload as { id: string }).id }; },
};
const payment = (): PaymentPayload => { const id = `sig${n++}`; return { x402Version: 2, accepted: REQ, payload: { id, signedTransaction: { signatures: { sender: id } } } }; };

let ops: Server, gw: Server, dataDir: string;
const leadCfg: ProxyConfig = { gatewayUrl: `${BASE}/mcp`, audience: 'mgate:customer-b', agentTokenId: '42', agentAddress: lead, privateKey: leadKey };
const subCfg: ProxyConfig = { gatewayUrl: `${BASE}/mcp`, audience: 'mgate:customer-b', agentTokenId: '77', agentAddress: sub, privateKey: subKey };

async function call(cfg: ProxyConfig, name: string, params: Record<string, unknown>, pay?: PaymentPayload) {
  const client = await connectGateway(cfg.gatewayUrl);
  const res = await client.callTool({ name, arguments: { params, auth: await signedCall(cfg, toolByName(name)!, params, pay) } }, undefined, { timeout: 30_000 });
  await client.close();
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}
async function approveNext() {
  for (let i = 0; i < 100; i++) {
    const list = await (await fetch(`${BASE}/approvals`)).json() as Array<{ id: string; digest: string }>;
    if (list.length) {
      await fetch(`${BASE}/approvals/${list[0].id}/presentation`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ presentation: { resourceId: list[0].digest } }) });
      return;
    }
    await new Promise((r) => setTimeout(r, 30));
  }
  throw new Error('no pending approval');
}
const asSub = (wo: WorkOrder, dls: SignedDelegation[], cfg = subCfg): ProxyConfig => ({ ...cfg, workOrder: wo, delegations: dls });
const status = (cfg: ProxyConfig) => call(cfg, 'service_status', { service: 'payments' });

before(async () => {
  ops = await startMockOps(OPS_PORT);
  dataDir = mkdtempSync(join(tmpdir(), 'mgate-dl-'));
  gw = await new Gateway({
    audience: 'mgate:customer-b', mockOpsUrl: `http://127.0.0.1:${OPS_PORT}`, dataDir,
    trustedAgents: [{ tokenId: '42', address: lead }, { tokenId: '77', address: sub }, { tokenId: '88', address: third }],
    mandates: { trustedIssuers: [ISSUER] },
  }, index, undefined, undefined, new ApprovalService({
    async createRequest(p) { return { requestJson: { resourceId: p.digest }, vraTx: 'vra' }; },
    async verifyPresentation(p, pres) { if ((pres as { resourceId?: string }).resourceId !== p.digest) throw new Error('bad'); return { credentialId: 'did:ccd:testnet:cred:aa', issuer: 'did:ccd:testnet:idp:0' }; },
  }, 5), processor).listen(GW_PORT);
});
after(() => { clearInterval(tick); gw.close(); ops.close(); });

test('sub-agent acts within its delegation; the chain is recorded in the audit log', async () => {
  const wo = makeWo(); anchor('MGATE-WO', woHash(wo));
  const dl = await signDelegation(makeDl(woHash(wo)), leadKey);
  const r = await call(asSub(wo, [dl]), 'logs_read', { service: 'payments' });
  assert.equal(r.status, 'ok');
  const recs = readFileSync(join(dataDir, 'audit.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const req = recs.filter((x) => x.kind === 'request').pop();
  assert.deepEqual(req.data.delegationChain, [woHash(wo), delegationHash(dl.delegation)]);
  assert.equal(req.data.agent, '77');
});

test('sub-agent cannot use what the lead has but did not delegate', async () => {
  const wo = makeWo(); anchor('MGATE-WO', woHash(wo));
  const dl = await signDelegation(makeDl(woHash(wo)), leadKey);
  assert.equal((await call(asSub(wo, [dl]), 'deploy_prod', { service: 'payments', version: 'v2.2.1' })).reason, 'work_order_out_of_scope');
  assert.equal((await call(asSub(wo, [dl]), 'logs_read', { service: 'billing' })).reason, 'work_order_out_of_scope');
});

test('a delegation can only narrow: wider scope, looser approval or rate, longer life are refused', async () => {
  const wo = makeWo(); anchor('MGATE-WO', woHash(wo)); const h = woHash(wo);
  const wider = await signDelegation(makeDl(h, { scope: { actions: [{ action: 'data.delete', resources: ['svc:payments'], approval: 'none' }] } }), leadKey);
  assert.equal((await status(asSub(wo, [wider]))).reason, 'delegation_scope_wider_than_parent');
  const looser = await signDelegation(makeDl(h, { scope: { actions: [{ action: 'deploy.prod', resources: ['svc:payments'], approval: 'none' }] } }), leadKey);
  assert.equal((await status(asSub(wo, [looser]))).reason, 'delegation_scope_wider_than_parent');
  const faster = await signDelegation(makeDl(h, { scope: { actions: [{ action: 'service.restart', resources: ['svc:payments'], approval: 'none', maxPerHour: 50 }] } }), leadKey);
  assert.equal((await status(asSub(wo, [faster]))).reason, 'delegation_scope_wider_than_parent');
  const allSvc = await signDelegation(makeDl(h, { scope: { actions: [{ action: 'service.restart', resources: ['svc:*'], approval: 'none', maxPerHour: 1 }] } }), leadKey);
  assert.equal((await status(asSub(wo, [allSvc]))).reason, 'delegation_scope_wider_than_parent');
  const longer = await signDelegation(makeDl(h, { expiresAt: wo.expiresAt + 60 }), leadKey);
  assert.equal((await status(asSub(wo, [longer]))).reason, 'delegation_outlives_parent');
});

test('the work order must allow delegation, and the chain may not be deeper than it says', async () => {
  const closed = makeWo({ delegation: undefined }); anchor('MGATE-WO', woHash(closed));
  const dl = await signDelegation(makeDl(woHash(closed)), leadKey);
  assert.equal((await status(asSub(closed, [dl]))).reason, 'delegation_not_allowed');
  const wo = makeWo(); anchor('MGATE-WO', woHash(wo));
  const d1 = await signDelegation(makeDl(woHash(wo)), leadKey);
  const d2 = await signDelegation(makeDl(delegationHash(d1.delegation), { depth: 2, delegator: { tokenId: '77', keyAddress: sub }, agent: { tokenId: '88', keyAddress: third } }), subKey);
  assert.equal((await status({ ...asSub(wo, [d1, d2]), agentTokenId: '88', agentAddress: third, privateKey: thirdKey })).reason, 'delegation_too_deep');
});

test('only the agent holding the parent can delegate, and a tampered delegation is refused', async () => {
  const wo = makeWo(); anchor('MGATE-WO', woHash(wo));
  const forged = await signDelegation(makeDl(woHash(wo), { delegator: { tokenId: '77', keyAddress: sub } }), subKey); // sub-agent grants itself
  assert.equal((await status(asSub(wo, [forged]))).reason, 'delegation_wrong_delegator');
  const dl = await signDelegation(makeDl(woHash(wo)), leadKey);
  const tampered = { ...dl, delegation: { ...dl.delegation, expiresAt: dl.delegation.expiresAt - 1 } };
  assert.equal((await status(asSub(wo, [tampered]))).reason, 'delegation_bad_signature');
});

test('revocation cascades down: revoking the work order stops the sub-agent; revoking the delegation stops only it', async () => {
  const wo = makeWo(); anchor('MGATE-WO', woHash(wo));
  const dl = await signDelegation(makeDl(woHash(wo)), leadKey);
  assert.equal((await status(asSub(wo, [dl]))).status, 'ok');
  anchor('MGATE-WOREV', delegationHash(dl.delegation));
  assert.equal((await status(asSub(wo, [dl]))).reason, 'work_order_revoked');
  assert.equal((await status({ ...leadCfg, workOrder: wo })).status, 'ok');
  const wo2 = makeWo(); anchor('MGATE-WO', woHash(wo2));
  const dl2 = await signDelegation(makeDl(woHash(wo2)), leadKey);
  anchor('MGATE-WOREV', woHash(wo2));
  assert.equal((await status(asSub(wo2, [dl2]))).reason, 'work_order_revoked');
});

test('customer kill switch on the work order stops every sub-agent under it; on a delegation only that one', async () => {
  const wo = makeWo(); anchor('MGATE-WO', woHash(wo));
  const dl = await signDelegation(makeDl(woHash(wo)), leadKey);
  assert.equal((await status(asSub(wo, [dl]))).status, 'ok');
  await gwSuspend(delegationHash(dl.delegation));
  assert.equal((await status(asSub(wo, [dl]))).reason, 'work_order_suspended_by_customer');
  assert.equal((await status({ ...leadCfg, workOrder: wo })).status, 'ok');
  const dlB = await signDelegation(makeDl(woHash(wo), { id: 'dl_other_1' }), leadKey);
  await gwSuspend(woHash(wo));
  assert.equal((await status(asSub(wo, [dlB]))).reason, 'work_order_suspended_by_customer');
  const st = await (await fetch(`${BASE}/dashboard/state`)).json();
  const row = st.workOrders.find((w: { hash: string }) => w.hash === delegationHash(dl.delegation));
  assert.equal(row.kind, 'delegation'); assert.equal(row.delegator, '42'); assert.equal(row.parent, woHash(wo));
});
async function gwSuspend(hash: string) {
  const r = await (await fetch(`${BASE}/dashboard/suspend`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ workOrderHash: hash }) })).json();
  assert.equal(r.ok, true);
}

test('budgets: a delegation cannot exceed what the parent has left, and sub-agent spending counts against the parent', async () => {
  const wo = makeWo({ budget: { maxSpendMicroCcd: '1000000' } }); anchor('MGATE-WO', woHash(wo)); // 1 CCD = two deploys
  const tooBig = await signDelegation(makeDl(woHash(wo), { budget: { maxSpendMicroCcd: '2000000' } }), leadKey);
  assert.equal((await status(asSub(wo, [tooBig]))).reason, 'delegation_budget_exceeds_parent');
  const deployer = await signDelegation(makeDl(woHash(wo), {
    scope: { actions: [{ action: 'deploy.prod', resources: ['svc:payments'], approval: 'required' }] }, budget: { maxSpendMicroCcd: '500000' } }), leadKey);
  const subDeploy = call(asSub(wo, [deployer]), 'deploy_prod', { service: 'payments', version: 'v2.2.1' }, payment());
  await approveNext();
  assert.equal((await subDeploy).status, 'ok');
  const leadDeploy = call({ ...leadCfg, workOrder: wo }, 'deploy_prod', { service: 'payments', version: 'v2.2.2' }, payment());
  await approveNext();
  assert.equal((await leadDeploy).status, 'ok');
  // Parent's 1 CCD is now spent (0.5 by the sub-agent, 0.5 by the lead): nobody can pay any more.
  assert.equal((await call({ ...leadCfg, workOrder: wo }, 'deploy_prod', { service: 'payments', version: 'v2.2.3' }, payment())).reason, 'budget_exceeded');
});
