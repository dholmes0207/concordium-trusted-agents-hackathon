import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { startMockOps } from '@mandate-gate/mock-ops';
import { signedCall, connectGateway, type ProxyConfig } from '@mandate-gate/agent-proxy';
import { toolByName, encodeAnchor, workOrderHashBytes, toHex, approverCommitment, verifyAuditFile, type WorkOrder } from '@mandate-gate/core';
import { Gateway } from '../src/gateway.js';
import { MandateIndex } from '../src/mandates.js';
import { ApprovalService, type ApprovalBackend } from '../src/approvals.js';
import type { AnchorSender } from '../src/anchorer.js';

// L3 (approval hold) and L4 (audit anchor before level-2 execution) with a fake chain backend.
const OPS_PORT = 17421, GW_PORT = 17420, BASE = `http://127.0.0.1:${GW_PORT}`;
const ISSUER = '3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw';
const ENGINEER = 'did:ccd:testnet:cred:' + 'ab'.repeat(48);
const SALT = 'c0'.repeat(16);
const agentKey = generatePrivateKey();
const agentAddr = privateKeyToAccount(agentKey).address;
const now = Math.floor(Date.now() / 1000);

const makeWo = (over: Partial<WorkOrder> = {}): WorkOrder => ({
  v: 1, id: 'wo_l3_' + Math.random().toString(36).slice(2, 10),
  issuer: { network: 'ccd:4221332d34e1694168c2a0c0b3fd0f27', account: ISSUER },
  audience: 'mgate:customer-b', agent: { tokenId: '42', keyAddress: agentAddr },
  scope: { actions: [
    { action: 'logs.read', resources: ['svc:*'], approval: 'none' },
    { action: 'deploy.prod', resources: ['svc:payments'], approval: 'required' },
  ] },
  notBefore: now - 60, expiresAt: now + 3600, nonce: 'e'.repeat(32), ...over,
});

const index = new MandateIndex(new Set([ISSUER]), 30, () => Date.now());
let height = 100n;
const block = (type: 'MGATE-WO' | 'MGATE-WOREV', wo: WorkOrder) => index.ingest({ height: height++, hash: 'h' + height, events: [{
  sender: ISSUER, txHash: `tx${height}`, dataHex: toHex(encodeAnchor({ type, version: 1, hash: workOrderHashBytes(wo) })) }] });
const tick = setInterval(() => index.ingest({ height: height++, hash: 'h' + height, events: [] }), 200);

// Fake chain side: the "presentation" just names a credential and the ResourceID it answers.
const backend: ApprovalBackend = {
  async createRequest(p) { return { requestJson: { resourceId: p.digest }, vraTx: 'vra_' + p.id }; },
  async verifyPresentation(p, pres) {
    const x = pres as { resourceId?: string; cred?: string };
    if (x.resourceId !== p.digest) throw new Error('resource_id_is_not_the_action_digest');
    return { credentialId: x.cred ?? ENGINEER, issuer: 'did:ccd:testnet:idp:0', vaaTx: 'vaa_' + p.id };
  },
};
let anchorFails = false; const anchored: number[] = [];
const sender: AnchorSender = async (a) => {
  if (anchorFails) throw new Error('node unreachable');
  anchored.push(a.seq);
  return { txHash: 'aud_' + a.seq, block: 'b', sender: 'gw', sponsor: null, costCcd: '0', explorer: '' } as never;
};

let ops: Server, gw: Server, gateway: Gateway, dataDir: string;
const base: ProxyConfig = { gatewayUrl: `${BASE}/mcp`, audience: 'mgate:customer-b', agentTokenId: '42', agentAddress: agentAddr, privateKey: agentKey };

async function call(wo: WorkOrder, name: string, params: Record<string, unknown>) {
  const client = await connectGateway(base.gatewayUrl);
  const res = await client.callTool({ name, arguments: { params, auth: await signedCall({ ...base, workOrder: wo }, toolByName(name)!, params) } }, undefined, { timeout: 30_000 });
  await client.close();
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}
/** Waits for the held approval to show up on the gateway's approval list. */
async function pending(): Promise<{ id: string; digest: string; consent: string }> {
  for (let i = 0; i < 100; i++) {
    const list = await (await fetch(`${BASE}/approvals`)).json() as Array<{ id: string; digest: string; consent: string }>;
    if (list.length) return list[0];
    await new Promise((r) => setTimeout(r, 30));
  }
  throw new Error('no pending approval');
}
const post = async (path: string, body?: unknown) => (await fetch(BASE + path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body ?? {}) })).json();
const deploy = { service: 'payments', version: 'v2.3.0' };

before(async () => {
  ops = await startMockOps(OPS_PORT);
  dataDir = mkdtempSync(join(tmpdir(), 'mgate-l3-'));
  gateway = new Gateway({
    audience: 'mgate:customer-b', mockOpsUrl: `http://127.0.0.1:${OPS_PORT}`, dataDir,
    trustedAgents: [{ tokenId: '42', address: agentAddr }], mandates: { trustedIssuers: [ISSUER] },
  }, index, undefined, sender, new ApprovalService(backend, 2));
  gw = await gateway.listen(GW_PORT);
});
after(() => { clearInterval(tick); gw.close(); ops.close(); });

test('held deploy runs after approval, and only after its decision is anchored (L3 + L4)', async () => {
  const wo = makeWo(); block('MGATE-WO', wo);
  const out = call(wo, 'deploy_prod', deploy);
  const p = await pending();
  assert.match(p.consent, /^Approve deploy\.prod on svc:payments \(service=payments, version=v2\.3\.0\)/);
  const page = await (await fetch(`${BASE}/approvals/${p.id}`)).text();
  assert.match(page, /Approve with Concordium wallet/);
  const r = await post(`/approvals/${p.id}/presentation`, { presentation: { resourceId: p.digest } });
  assert.equal(r.status, 'approved');
  const res = await out;
  assert.equal(res.status, 'ok');
  assert.ok(res.lastAnchor && res.lastAnchor.txHash.startsWith('aud_'));
  // The anchor covers the allow decision, which comes after the approval record.
  const recs = readFileSync(join(dataDir, 'audit.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  const allow = recs.find((x) => x.kind === 'decision' && x.data.decision === 'allow' && x.data.approvalId === p.id);
  const appr = recs.find((x) => x.kind === 'approval' && x.data.approvalId === p.id);
  assert.ok(appr && allow && appr.seq < allow.seq && anchored.at(-1)! >= allow.seq);
  assert.equal(appr.data.approver.credentialId, ENGINEER);
  assert.equal(verifyAuditFile(join(dataDir, 'audit.jsonl')).ok, true);
  // Single use: a second presentation does not change the settled approval.
  assert.equal((await post(`/approvals/${p.id}/presentation`, { presentation: { resourceId: p.digest } })).status, 'approved');
});

test('approval for a different action digest is rejected', async () => {
  const wo = makeWo(); block('MGATE-WO', wo);
  const out = call(wo, 'deploy_prod', deploy);
  const p = await pending();
  await post(`/approvals/${p.id}/presentation`, { presentation: { resourceId: '00'.repeat(32) } });
  const res = await out;
  assert.equal(res.status, 'denied');
  assert.match(res.reason, /^presentation_invalid: resource_id_is_not_the_action_digest/);
});

test('engineer rejects', async () => {
  const wo = makeWo(); block('MGATE-WO', wo);
  const out = call(wo, 'deploy_prod', deploy);
  const p = await pending();
  assert.equal((await post(`/approvals/${p.id}/reject`)).status, 'rejected');
  assert.equal((await out).reason, 'rejected_by_approver');
});

test('nobody approves within the hold time: fail closed', async () => {
  const wo = makeWo(); block('MGATE-WO', wo);
  const res = await call(wo, 'deploy_prod', deploy);
  assert.equal(res.reason, 'approval_timeout');
});

test('work order names the approver: wrong engineer, missing salt, right engineer', async () => {
  const wo = makeWo({ approval: { scheme: 'mgate/approver/v1', approverCommitment: approverCommitment([{ type: 'account-cred', value: ENGINEER }], SALT) } });
  block('MGATE-WO', wo);
  let out = call(wo, 'deploy_prod', deploy); let p = await pending();
  await post(`/approvals/${p.id}/presentation`, { presentation: { resourceId: p.digest, cred: 'did:ccd:testnet:cred:' + 'cd'.repeat(48) }, salt: SALT });
  assert.equal((await out).reason, 'approver_not_named_in_work_order');
  out = call(wo, 'deploy_prod', deploy); p = await pending();
  await post(`/approvals/${p.id}/presentation`, { presentation: { resourceId: p.digest } });
  assert.equal((await out).reason, 'approver_salt_missing');
  out = call(wo, 'deploy_prod', deploy); p = await pending();
  await post(`/approvals/${p.id}/presentation`, { presentation: { resourceId: p.digest }, salt: SALT });
  assert.equal((await out).status, 'ok');
});

test('work order revoked while the action is held', async () => {
  const wo = makeWo(); block('MGATE-WO', wo);
  const out = call(wo, 'deploy_prod', deploy);
  const p = await pending();
  block('MGATE-WOREV', wo);
  await post(`/approvals/${p.id}/presentation`, { presentation: { resourceId: p.digest } });
  assert.equal((await out).reason, 'work_order_revoked');
});

test('L4: if the audit anchor cannot be finalized, the level-2 action does not run', async () => {
  const wo = makeWo(); block('MGATE-WO', wo);
  anchorFails = true;
  const out = call(wo, 'deploy_prod', deploy);
  const p = await pending();
  await post(`/approvals/${p.id}/presentation`, { presentation: { resourceId: p.digest } });
  const res = await out;
  anchorFails = false;
  assert.equal(res.reason, 'audit_anchor_failed');
  const recs = readFileSync(join(dataDir, 'audit.jsonl'), 'utf8').trim().split('\n').map((l) => JSON.parse(l));
  assert.equal(recs.at(-1).data.reason, 'audit_anchor_failed');
  assert.ok(existsSync(join(dataDir, 'anchors.jsonl')));
});

test('level-0 actions are not delayed by anchoring', async () => {
  const wo = makeWo(); block('MGATE-WO', wo);
  const before = anchored.length;
  assert.equal((await call(wo, 'logs_read', { service: 'payments' })).status, 'ok');
  assert.equal(anchored.length, before);
});
