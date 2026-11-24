import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import {
  signRequest, verifyEnvelope, paramsHash, newRequestId, requestHash, type AgentRequest,
  RequestLedger, AuditLog, verifyAuditFile, encodeAnchor, decodeAnchor, sha256,
} from '../src/index.js';

const pk = generatePrivateKey();
const addr = privateKeyToAccount(pk).address;
const now = Math.floor(Date.now() / 1000);
const base = (over: Partial<AgentRequest> = {}): AgentRequest => ({
  v: 1, audience: 'mgate:customer-b',
  agent: { network: 'ccd:test', registry: { index: '12802', subindex: '0' }, tokenId: '1',
    key: { namespace: 'eip155:84532', keyType: 'secp256k1-uncompressed', address: addr } },
  workOrderHash: null, action: 'logs.read', resource: 'svc:payments',
  paramsHash: paramsHash({ service: 'payments' }), requestId: newRequestId(),
  issuedAt: now, expiresAt: now + 30, ...over,
});

test('valid envelope verifies', async () => {
  const s = await signRequest(base(), pk);
  assert.deepEqual(await verifyEnvelope(s, { audience: 'mgate:customer-b', params: { service: 'payments' } }), { ok: true });
});

test('negative #1: signed by another key (impersonation)', async () => {
  const s = await signRequest({ ...base(), agent: { ...base().agent, key: { ...base().agent.key, address: privateKeyToAccount(generatePrivateKey()).address } } }, generatePrivateKey()).catch(() => null);
  assert.equal(s, null, 'signRequest refuses a key that does not match the claimed address');
  const good = await signRequest(base(), pk);
  const forged = { ...good, request: { ...good.request, agent: { ...good.request.agent, key: { ...good.request.agent.key, address: privateKeyToAccount(generatePrivateKey()).address } } } };
  assert.deepEqual(await verifyEnvelope(forged, { audience: 'mgate:customer-b' }), { ok: false, reason: 'signer_mismatch' });
});

test('tampered action or params is rejected', async () => {
  const s = await signRequest(base(), pk);
  const t = { ...s, request: { ...s.request, action: 'deploy.prod' } };
  assert.deepEqual(await verifyEnvelope(t, { audience: 'mgate:customer-b' }), { ok: false, reason: 'signer_mismatch' });
  assert.deepEqual(await verifyEnvelope(s, { audience: 'mgate:customer-b', params: { service: 'billing' } }), { ok: false, reason: 'params_mismatch' });
});

test('negative #5: expired, too long ttl, wrong audience', async () => {
  const exp = await signRequest(base({ issuedAt: now - 120, expiresAt: now - 90 }), pk);
  assert.equal((await verifyEnvelope(exp, { audience: 'mgate:customer-b' })).ok, false);
  const long = await signRequest(base({ expiresAt: now + 3600 }), pk);
  assert.deepEqual(await verifyEnvelope(long, { audience: 'mgate:customer-b' }), { ok: false, reason: 'ttl_too_long' });
  const s = await signRequest(base(), pk);
  assert.deepEqual(await verifyEnvelope(s, { audience: 'mgate:other' }), { ok: false, reason: 'bad_audience' });
});

test('negative #17: duplicate request id executes once; reuse with other content is a conflict', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mg-'));
  const l = new RequestLedger(join(dir, 'ledger.jsonl'));
  const r = base();
  assert.equal(l.reserve(r.requestId, requestHash(r), r.expiresAt), 'reserved');
  assert.equal(l.reserve(r.requestId, requestHash(r), r.expiresAt), 'duplicate');
  assert.equal(l.reserve(r.requestId, requestHash({ ...r, action: 'x' }), r.expiresAt), 'conflict');
  const reloaded = new RequestLedger(join(dir, 'ledger.jsonl'));
  assert.equal(reloaded.reserve(r.requestId, requestHash(r), r.expiresAt), 'duplicate', 'survives restart');
});

test('negative #16: editing one audit line breaks the chain', () => {
  const dir = mkdtempSync(join(tmpdir(), 'mg-'));
  const f = join(dir, 'audit.jsonl');
  const log = new AuditLog(f);
  log.append('request', { a: 1 }); log.append('decision', { allow: true }); log.append('execution', { ok: true });
  assert.equal(verifyAuditFile(f).ok, true);
  const lines = readFileSync(f, 'utf8').trim().split('\n');
  const r = JSON.parse(lines[1]); r.data.allow = false; lines[1] = JSON.stringify(r);
  writeFileSync(f, lines.join('\n') + '\n');
  assert.deepEqual(verifyAuditFile(f), { ok: false, brokenAt: 1, records: 3 });
});

test('anchor CBOR round-trips and stays under 256 bytes', () => {
  const a = { type: 'MGATE-AUD' as const, version: 1 as const, hash: sha256('x'), seq: 7 };
  const bytes = encodeAnchor(a);
  assert.ok(bytes.length < 80);
  assert.deepEqual(decodeAnchor(bytes), a);
});
