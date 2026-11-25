// Company A's work-order tool.
//   pnpm wo issue  [--hours 8] [--sponsor] [--approver <credId|did>]
//                                              build a work order for agent 1505, anchor MGATE-WO;
//                                              --approver names the engineer who may approve (salted commitment)
//   pnpm wo revoke <wo-file> [--sponsor]       anchor MGATE-WOREV for an issued work order
//   pnpm wo show   <wo-file>                   print the order and its hash
// Orders are written to .data/work-orders/ (not secret, not committed).
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { randomBytes } from 'node:crypto';
import { WorkOrderSchema, workOrderHash, workOrderHashBytes, loadAgentKey, CCD_TESTNET_CAIP2, sendAnchor, loadAccount, approverCommitment, type WorkOrder } from '@mandate-gate/core';


const DIR = resolve(process.env.MGATE_DATA ?? join(import.meta.dirname, '../../../.data/work-orders'));
const AGENT_TOKEN_ID = process.env.MGATE_AGENT_TOKEN_ID ?? '1505';
const AUDIENCE = process.env.MGATE_AUDIENCE ?? 'mgate:customer-b';
const [cmd, arg] = process.argv.slice(2);
const flag = (n: string) => process.argv.includes(n);
const opt = (n: string, d: string) => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : d; };

/** The approver's account credential as it appears in a V&A V1 presentation (credentialSubject.id). */
const credDid = (v: string) => (v.startsWith('did:') ? v : `did:ccd:testnet:cred:${v}`);

function demoOrder(hours: number, commitment?: string): WorkOrder {
  const now = Math.floor(Date.now() / 1000);
  return {
    v: 1,
    id: `wo_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${randomBytes(3).toString('hex')}`,
    issuer: { network: CCD_TESTNET_CAIP2, account: loadAccount('company-A.export').base58 },
    audience: AUDIENCE,
    agent: { tokenId: AGENT_TOKEN_ID, keyAddress: loadAgentKey().address },
    scope: { actions: [
      { action: 'logs.read', resources: ['svc:*'], approval: 'none' },
      { action: 'service.status', resources: ['svc:*'], approval: 'none' },
      { action: 'service.restart', resources: ['svc:payments', 'svc:billing'], approval: 'none', maxPerHour: 5 },
      { action: 'service.scale', resources: ['svc:payments'], approval: 'none', maxPerHour: 5 },
      { action: 'deploy.prod', resources: ['svc:payments'], approval: 'required' },
    ] },
    notBefore: now - 60,
    expiresAt: now + hours * 3600,
    ...(commitment ? { approval: { scheme: 'mgate/approver/v1' as const, approverCommitment: commitment } } : {}),
    nonce: randomBytes(16).toString('hex'),
  };
}

if (cmd === 'issue') {
  const approver = opt('--approver', '');
  const salt = approver ? randomBytes(16).toString('hex') : '';
  const commitment = approver ? approverCommitment([{ type: 'account-cred', value: credDid(approver) }], salt) : undefined;
  const wo = WorkOrderSchema.parse(demoOrder(Number(opt('--hours', '8')), commitment));
  mkdirSync(DIR, { recursive: true });
  const file = join(DIR, `${wo.id}.json`);
  writeFileSync(file, JSON.stringify(wo, null, 2));
  if (salt) {
    // The salt opens the commitment: company A gives it to the named engineer (approval link #salt=…).
    writeFileSync(join(DIR, `${wo.id}.approver-salt`), salt + '\n', { mode: 0o600 });
    console.log('approver   : commitment in work order, salt in', join(DIR, `${wo.id}.approver-salt`));
  }
  console.log('work order :', file);
  console.log('hash       :', workOrderHash(wo));
  const r = await sendAnchor({ type: 'MGATE-WO', version: 1, hash: workOrderHashBytes(wo) }, 'company-A.export', flag('--sponsor') ? 'gateway-B.export' : undefined);
  console.log('anchored   :', JSON.stringify(r, null, 2));
} else if (cmd === 'revoke' && arg) {
  const wo = WorkOrderSchema.parse(JSON.parse(readFileSync(arg, 'utf8')));
  console.log('revoking   :', wo.id, workOrderHash(wo));
  const r = await sendAnchor({ type: 'MGATE-WOREV', version: 1, hash: workOrderHashBytes(wo) }, 'company-A.export', flag('--sponsor') ? 'gateway-B.export' : undefined);
  console.log('anchored   :', JSON.stringify(r, null, 2));
} else if (cmd === 'show' && arg) {
  const wo = WorkOrderSchema.parse(JSON.parse(readFileSync(arg, 'utf8')));
  console.log(JSON.stringify(wo, null, 2)); console.log('hash:', workOrderHash(wo));
} else {
  console.error('usage: pnpm wo issue [--hours 8] [--sponsor] [--approver <credId>] | revoke <file> [--sponsor] | show <file>');
  process.exit(1);
}
