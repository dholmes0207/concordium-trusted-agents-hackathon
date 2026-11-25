// End-to-end run against Concordium testnet (read-only for the gateway):
// mock infrastructure + MandateGate in chain mode (on-chain agent checks, mandate index following
// finalized blocks) + a client signing with agent #1505's key and carrying a real anchored work order.
// Usage: pnpm tsx scripts/testnet-e2e.ts <work-order.json> <startHeight>
import { readFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { startMockOps } from '@mandate-gate/mock-ops';
import { signedCall, connectGateway } from '@mandate-gate/agent-proxy';
import { WorkOrderSchema, workOrderHash, loadAgentKey, toolByName, CCD_GRPC } from '@mandate-gate/core';
import { Gateway } from '../src/gateway.js';
import { MandateIndex, grpcChainSource } from '../src/mandates.js';
import { RegistryAgentVerifier } from '../src/agents.js';

const [woFile, startArg] = process.argv.slice(2);
const wo = WorkOrderSchema.parse(JSON.parse(readFileSync(woFile, 'utf8')));
const companyA = wo.issuer.account;
const key = loadAgentKey();
const OPS = 17501, GW = 17500;

const index = new MandateIndex(new Set([companyA]), 60);
const follow = index.follow(await grpcChainSource(CCD_GRPC.host, CCD_GRPC.port), BigInt(startArg));
follow.catch((e) => console.error('follower stopped:', e.message));
const ops = await startMockOps(OPS);
const gw = await new Gateway({
  audience: wo.audience, mockOpsUrl: `http://127.0.0.1:${OPS}`, dataDir: mkdtempSync(join(tmpdir(), 'mgate-testnet-')),
  trustedAgents: [], onboardedOwners: [companyA], mandates: { trustedIssuers: [companyA], maxStalenessSeconds: 60 },
}, index, new RegistryAgentVerifier(new Set([companyA]))).listen(GW);

// Wait until the index has caught up with the chain tip.
process.stdout.write('catching up from height ' + startArg);
for (let i = 0; i < 180; i++) {
  const st = index.status(workOrderHash(wo), companyA);
  if (st.status === 'active' || st.status === 'revoked') { console.log(`\nindex at ${index.lastHeight}: work order ${st.status}`); break; }
  await new Promise((r) => setTimeout(r, 1000)); process.stdout.write('.');
}

const cfg = { gatewayUrl: `http://127.0.0.1:${GW}/mcp`, audience: wo.audience, agentTokenId: wo.agent.tokenId, agentAddress: key.address, privateKey: key.privateKey, workOrder: wo };
async function call(name: string, params: Record<string, unknown>, c = cfg) {
  const client = await connectGateway(c.gatewayUrl);
  const res = await client.callTool({ name, arguments: { params, auth: await signedCall(c, toolByName(name)!, params) } });
  await client.close();
  const out = JSON.parse((res.content as Array<{ text: string }>)[0].text);
  console.log(`${name.padEnd(16)} ${JSON.stringify(params).padEnd(44)} -> ${out.status}${out.reason ? ' (' + out.reason + ')' : ''}`);
  return out;
}

await call('logs_read', { service: 'payments' });
await call('service_restart', { service: 'payments' });
await call('data_delete', { service: 'payments' });
await call('deploy_prod', { service: 'payments', version: 'v2.3.0' });
await call('logs_read', { service: 'payments' }, { ...cfg, agentTokenId: '601' });
await call('logs_read', { service: 'payments' }, { ...cfg, workOrder: undefined } as any);

if (process.env.WAIT_FOR_REVOCATION) {
  console.log('\nwaiting for a revocation anchor (run `pnpm --filter @mandate-gate/issuer wo revoke ...` now)…');
  const t0 = Date.now();
  while (index.status(workOrderHash(wo), companyA).status !== 'revoked' && Date.now() - t0 < 300_000) await new Promise((r) => setTimeout(r, 1000));
  console.log(`revocation seen after ${((Date.now() - t0) / 1000).toFixed(0)} s at height ${index.lastHeight}`);
  await call('logs_read', { service: 'payments' });
}
gw.close(); ops.close(); process.exit(0);
