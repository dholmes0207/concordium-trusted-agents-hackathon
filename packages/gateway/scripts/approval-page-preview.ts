// Serves the approval page with a fake backend and one pending approval (no chain, no keys).
// Usage: pnpm tsx scripts/approval-page-preview.ts   then open the printed URL.
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Gateway } from '../src/gateway.js';
import { ApprovalService } from '../src/approvals.js';

const svc = new ApprovalService({
  async createRequest(p) { return { requestJson: { preview: true, resourceId: p.digest }, vraTx: '0'.repeat(64) }; },
  async verifyPresentation() { throw new Error('preview only'); },
}, 600);
const gw = new Gateway({ audience: 'mgate:customer-b', mockOpsUrl: 'http://127.0.0.1:1', dataDir: mkdtempSync(join(tmpdir(), 'mgate-prev-')), trustedAgents: [] },
  undefined, undefined, undefined, svc);
await gw.listen(17600);
const p = await svc.create({ audience: 'mgate:customer-b', agentTokenId: '1505', workOrderHash: 'ab'.repeat(32), requestHash: 'cd'.repeat(32),
  action: 'deploy.prod', resource: 'svc:payments', paramsHash: 'ef'.repeat(32) }, { service: 'payments', version: 'v2.3.0' });
console.log(`http://127.0.0.1:17600/approvals/${p.id}`);
