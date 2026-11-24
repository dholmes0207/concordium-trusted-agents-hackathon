import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WorkOrderSchema, workOrderHash, checkScope, resourceMatches, approvalDigest, consentText, approverCommitment, type WorkOrder } from '../src/index.js';

const now = Math.floor(Date.now() / 1000);
const wo: WorkOrder = {
  v: 1, id: 'wo_demo_0001',
  issuer: { network: 'ccd:4221332d34e1694168c2a0c0b3fd0f27', account: '3Rgk3fkCJVsyqdpetE7Xq6w8KFhY7RQhQh8na1Qc36b4A26gaw' },
  audience: 'mgate:customer-b',
  agent: { tokenId: '42', keyAddress: '0xA3198Ee065B9f633aa36030C34310836Bf37c650' },
  scope: { actions: [
    { action: 'logs.read', resources: ['svc:*'], approval: 'none' },
    { action: 'service.restart', resources: ['svc:payments'], approval: 'none', maxPerHour: 5 },
    { action: 'deploy.prod', resources: ['svc:payments'], approval: 'required' },
  ] },
  notBefore: now - 60, expiresAt: now + 3600, nonce: 'a'.repeat(32),
};
const req = (over = {}) => ({ audience: 'mgate:customer-b', tokenId: '42', keyAddress: wo.agent.keyAddress, action: 'logs.read', resource: 'svc:billing', ...over });

test('schema accepts the sample and rejects unknown fields', () => {
  assert.equal(WorkOrderSchema.safeParse(wo).success, true);
  assert.equal(WorkOrderSchema.safeParse({ ...wo, extra: 1 }).success, false);
});

test('hash is stable under key order and changes with content', () => {
  const reordered = JSON.parse(JSON.stringify(Object.fromEntries(Object.entries(wo).reverse())));
  assert.equal(workOrderHash(reordered), workOrderHash(wo));
  assert.notEqual(workOrderHash({ ...wo, expiresAt: wo.expiresAt + 1 }), workOrderHash(wo));
});

test('scope: allowed, needs approval, and negatives #7 #9 #10', () => {
  assert.deepEqual(checkScope(wo, req(), now), { ok: true, approval: 'none', maxPerHour: undefined });
  assert.equal((checkScope(wo, req({ action: 'deploy.prod', resource: 'svc:payments' }), now) as any).approval, 'required');
  assert.deepEqual(checkScope(wo, req({ action: 'data.delete', resource: 'svc:payments' }), now), { ok: false, reason: 'out_of_scope' });
  assert.deepEqual(checkScope(wo, req({ action: 'service.restart', resource: 'svc:billing' }), now), { ok: false, reason: 'out_of_scope' });
  assert.deepEqual(checkScope(wo, req({ tokenId: '43' }), now), { ok: false, reason: 'wrong_agent' });
  assert.deepEqual(checkScope(wo, req({ audience: 'mgate:other' }), now), { ok: false, reason: 'wrong_audience' });
  assert.deepEqual(checkScope(wo, req(), wo.expiresAt), { ok: false, reason: 'expired' });
});

test('resource globbing does not treat regex characters specially', () => {
  assert.equal(resourceMatches('svc:pay.ments', 'svc:payXments'), false);
  assert.equal(resourceMatches('env:staging/*', 'env:staging/api'), true);
});

test('approval digest binds every field; consent text is derived from it', () => {
  const s = { audience: 'mgate:customer-b', agentTokenId: '42', workOrderHash: workOrderHash(wo), requestHash: 'b'.repeat(64),
    action: 'deploy.prod', resource: 'svc:payments', paramsHash: 'c'.repeat(64), nonce: 'd'.repeat(64), expiresAt: now + 300 };
  const d = approvalDigest(s);
  assert.notEqual(approvalDigest({ ...s, resource: 'svc:billing' }), d);
  assert.match(consentText(s, { service: 'payments', version: 'v2.3.0' }), /Approve deploy\.prod on svc:payments \(service=payments, version=v2\.3\.0\)/);
  const c = approverCommitment([{ type: 'account-cred', value: 'did:ccd:testnet:cred:abc' }], 'e'.repeat(32));
  assert.notEqual(c, approverCommitment([{ type: 'account-cred', value: 'did:ccd:testnet:cred:abd' }], 'e'.repeat(32)));
});
