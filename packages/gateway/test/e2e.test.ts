import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { Server } from 'node:http';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { startMockOps } from '@mandate-gate/mock-ops';
import { signedCall, connectGateway, type ProxyConfig } from '@mandate-gate/agent-proxy';
import { toolByName, verifyAuditFile, type SignedRequest } from '@mandate-gate/core';
import { Gateway } from '../src/gateway.js';

const OPS_PORT = 17401, GW_PORT = 17400;
const agentKey = generatePrivateKey();
const agentAddr = privateKeyToAccount(agentKey).address;
const dataDir = mkdtempSync(join(tmpdir(), 'mgate-e2e-'));
let ops: Server, gw: Server;

const cfg: ProxyConfig = {
  gatewayUrl: `http://127.0.0.1:${GW_PORT}/mcp`, audience: 'mgate:customer-b',
  agentTokenId: '42', agentAddress: agentAddr, privateKey: agentKey, runtime: { model: 'test' },
};

async function call(name: string, params: Record<string, unknown>, auth?: SignedRequest) {
  const client = await connectGateway(cfg.gatewayUrl);
  const tool = toolByName(name)!;
  const res = await client.callTool({ name, arguments: { params, auth: auth ?? await signedCall(cfg, tool, params) } });
  await client.close();
  return JSON.parse((res.content as Array<{ text: string }>)[0].text);
}

before(async () => {
  ops = await startMockOps(OPS_PORT);
  gw = await new Gateway({
    audience: 'mgate:customer-b', mockOpsUrl: `http://127.0.0.1:${OPS_PORT}`, dataDir,
    trustedAgents: [{ tokenId: '42', address: agentAddr }],
  }).listen(GW_PORT);
});
after(() => { gw.close(); ops.close(); });

test('level 0: signed logs.read goes through to the customer infrastructure', async () => {
  const out = await call('logs_read', { service: 'payments' });
  assert.equal(out.status, 'ok');
  assert.match(JSON.stringify(out.result), /connection pool exhausted/);
});

test('level 1: restart is allowed and executed', async () => {
  const out = await call('service_restart', { service: 'payments' });
  assert.equal(out.status, 'ok');
});

test('negative #1: a different key claiming to be agent 42 is denied', async () => {
  const otherKey = generatePrivateKey();
  const forgedCfg = { ...cfg, agentAddress: privateKeyToAccount(otherKey).address, privateKey: otherKey };
  const auth = await signedCall(forgedCfg, toolByName('logs_read')!, { service: 'payments' });
  const out = await call('logs_read', { service: 'payments' }, auth);
  assert.deepEqual([out.status, out.reason], ['denied', 'key_not_bound_to_agent']);
});

test('negative #5/#17: replaying the same signed request is denied', async () => {
  const auth = await signedCall(cfg, toolByName('service_status')!, { service: 'billing' });
  assert.equal((await call('service_status', { service: 'billing' }, auth)).status, 'ok');
  const again = await call('service_status', { service: 'billing' }, auth);
  assert.deepEqual([again.status, again.reason], ['denied', 'replayed_request']);
});

test('params swapped after signing are denied', async () => {
  const auth = await signedCall(cfg, toolByName('service_scale')!, { service: 'payments', replicas: 3 });
  const out = await call('service_scale', { service: 'payments', replicas: 10 }, auth);
  assert.deepEqual([out.status, out.reason], ['denied', 'params_mismatch']);
});

test('level 2: deploy.prod is held for human approval (L3 not wired yet)', async () => {
  const out = await call('deploy_prod', { service: 'payments', version: 'v2.3.0' });
  assert.equal(out.status, 'approval_required');
});

test('negative #23: oversized body is refused before parsing', async () => {
  const res = await fetch(cfg.gatewayUrl, { method: 'POST', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' }, body: 'x'.repeat(70_000) });
  assert.equal(res.status, 413);
});

test('negative #16: audit chain is intact after all of the above', () => {
  const v = verifyAuditFile(join(dataDir, 'audit.jsonl'));
  assert.equal(v.ok, true);
  assert.ok(v.records >= 10);
});
