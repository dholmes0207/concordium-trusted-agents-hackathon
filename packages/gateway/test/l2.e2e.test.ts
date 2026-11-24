import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { startMockOps } from '@mandate-gate/mock-ops';
import { signedCall, connectGateway, type ProxyConfig } from '@mandate-gate/agent-proxy';
import { toolByName, encodeAnchor, workOrderHashBytes, toHex, type WorkOrder } from '@mandate-gate/core';
import { Gateway } from '../src/gateway.js';
import { MandateIndex } from '../src/mandates.js';

const OPS_PORT = 17411, GW_PORT = 17410;
const ISSUER = '3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw'; // company A (testnet account)
const OTHER = '3Exu4kLu375FiXzUE8rxCjnRcYhxsJZwCoyUqDudHS78hVbkss';
const agentKey = generatePrivateKey();
const agentAddr = privateKeyToAccount(agentKey).address;
const now = Math.floor(Date.now() / 1000);

const makeWo = (over: Partial<WorkOrder> = {}): WorkOrder => ({
  v: 1, id: 'wo_e2e_' + Math.random().toString(36).slice(2, 10),
  issuer: { network: 'ccd:4221332d34e1694168c2a0c0b3fd0f27', account: ISSUER },
  audience: 'mgate:customer-b', agent: { tokenId: '42', keyAddress: agentAddr },
  scope: { actions: [
    { action: 'logs.read', resources: ['svc:*'], approval: 'none' },
    { action: 'service.restart', resources: ['svc:payments'], approval: 'none', maxPerHour: 2 },
    { action: 'deploy.prod', resources: ['svc:payments'], approval: 'required' },
  ] },
  notBefore: now - 60, expiresAt: now + 3600, nonce: 'f'.repeat(32), ...over,
});

let clock = Date.now();
const index = new MandateIndex(new Set([ISSUER]), 30, () => clock);
let height = 100n;
const block = (events: Array<{ sender: string; type: 'MGATE-WO' | 'MGATE-WOREV'; wo: WorkOrder }>) =>
  index.ingest({ height: height++, hash: 'h' + height, events: events.map((e, i) => ({
    sender: e.sender, txHash: `tx${height}_${i}`,
    dataHex: toHex(encodeAnchor({ type: e.type, version: 1, hash: workOrderHashBytes(e.wo) })),
  })) });

let ops: Server, gw: Server;
const base: ProxyConfig = { gatewayUrl: `http://127.0.0.1:${GW_PORT}/mcp`, audience: 'mgate:customer-b', agentTokenId: '42', agentAddress: agentAddr, privateKey: agentKey };

async function call(cfg: ProxyConfig, name: string, params: Record<string, unknown>) {
  const client = await connectGateway(cfg.gatewayUrl);
  const res = await client.callTool({ name, arguments: { params, auth: await signedCall(cfg, toolByName(name)!, params) } });
  await client.close();
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

before(async () => {
  ops = await startMockOps(OPS_PORT);
  gw = await new Gateway({
    audience: 'mgate:customer-b', mockOpsUrl: `http://127.0.0.1:${OPS_PORT}`, dataDir: mkdtempSync(join(tmpdir(), 'mgate-l2-')),
    trustedAgents: [{ tokenId: '42', address: agentAddr }], mandates: { trustedIssuers: [ISSUER] },
  }, index).listen(GW_PORT);
});
after(() => { gw.close(); ops.close(); });

test('anchored work order allows in-scope actions', async () => {
  const wo = makeWo(); block([{ sender: ISSUER, type: 'MGATE-WO', wo }]);
  assert.equal((await call({ ...base, workOrder: wo }, 'logs_read', { service: 'billing' })).status, 'ok');
});

test('no work order, or one that was never anchored, is denied', async () => {
  block([]);
  assert.equal((await call(base, 'logs_read', { service: 'billing' })).reason, 'work_order_missing_or_malformed');
  assert.equal((await call({ ...base, workOrder: makeWo() }, 'logs_read', { service: 'billing' })).reason, 'work_order_not_anchored');
});

test('anchor from an untrusted account does not count', async () => {
  const wo = makeWo(); block([{ sender: OTHER, type: 'MGATE-WO', wo }]);
  assert.equal((await call({ ...base, workOrder: wo }, 'logs_read', { service: 'billing' })).reason, 'work_order_not_anchored');
});

test('negative #10 / #19: out-of-scope action is denied even though the order exists', async () => {
  const wo = makeWo(); block([{ sender: ISSUER, type: 'MGATE-WO', wo }]);
  assert.equal((await call({ ...base, workOrder: wo }, 'data_delete', { service: 'payments' })).reason, 'work_order_out_of_scope');
  assert.equal((await call({ ...base, workOrder: wo }, 'service_restart', { service: 'billing' })).reason, 'work_order_out_of_scope');
});

test('negative #7: expired work order', async () => {
  const wo = makeWo({ notBefore: now - 7200, expiresAt: now - 3600 }); block([{ sender: ISSUER, type: 'MGATE-WO', wo }]);
  assert.equal((await call({ ...base, workOrder: wo }, 'logs_read', { service: 'billing' })).reason, 'work_order_expired');
});

test('negative #8: revoked work order stops working at the next block', async () => {
  const wo = makeWo(); block([{ sender: ISSUER, type: 'MGATE-WO', wo }]);
  assert.equal((await call({ ...base, workOrder: wo }, 'logs_read', { service: 'payments' })).status, 'ok');
  block([{ sender: ISSUER, type: 'MGATE-WOREV', wo }]);
  assert.equal((await call({ ...base, workOrder: wo }, 'logs_read', { service: 'payments' })).reason, 'work_order_revoked');
});

test('negative #9: work order for another agent', async () => {
  const wo = makeWo({ agent: { tokenId: '43', keyAddress: agentAddr } }); block([{ sender: ISSUER, type: 'MGATE-WO', wo }]);
  assert.equal((await call({ ...base, workOrder: wo }, 'logs_read', { service: 'payments' })).reason, 'work_order_wrong_agent');
});

test('rate limit from the work order (maxPerHour)', async () => {
  const wo = makeWo(); block([{ sender: ISSUER, type: 'MGATE-WO', wo }]);
  const c = { ...base, workOrder: wo };
  assert.equal((await call(c, 'service_restart', { service: 'payments' })).status, 'ok');
  assert.equal((await call(c, 'service_restart', { service: 'payments' })).status, 'ok');
  assert.equal((await call(c, 'service_restart', { service: 'payments' })).reason, 'rate_limited');
});

test('approval required by the work order holds the action (L3 pending)', async () => {
  const wo = makeWo(); block([{ sender: ISSUER, type: 'MGATE-WO', wo }]);
  assert.equal((await call({ ...base, workOrder: wo }, 'deploy_prod', { service: 'payments', version: 'v2.3.0' })).status, 'approval_required');
});

test('negative #21: stale chain view fails closed', async () => {
  const wo = makeWo(); block([{ sender: ISSUER, type: 'MGATE-WO', wo }]);
  clock += 31_000; // no finalized block for 31 s
  assert.equal((await call({ ...base, workOrder: wo }, 'logs_read', { service: 'payments' })).reason, 'revocation_status_stale');
  clock -= 31_000;
});
