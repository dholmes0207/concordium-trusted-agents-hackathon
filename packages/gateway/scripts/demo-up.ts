// One command for the live demo: customer B's simulated infrastructure + MandateGate (chain mode,
// L1–L4) reading testnet from the current work order's anchor height.
//   pnpm demo:up            (after `pnpm --filter @mandate-gate/issuer wo issue --sponsor`)
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { startMockOps } from '@mandate-gate/mock-ops';
import { startK8sOps, DEFAULT_K8S } from '@mandate-gate/k8s-ops';
import type { GatewayConfig } from '../src/gateway.js';
import { startGateway } from '../src/run.js';
import { WorkOrderSchema } from '@mandate-gate/core';

const root = join(import.meta.dirname, '../../..');
const meta = join(root, '.data/work-orders/current.meta.json');
if (!existsSync(meta)) { console.error('No current work order. Run: pnpm --filter @mandate-gate/issuer wo issue --hours 3 --sponsor'); process.exit(1); }
const m = JSON.parse(readFileSync(meta, 'utf8')) as { hash: string; anchorHeight: string; anchorTx: string };
execFileSync('node', [join(import.meta.dirname, '../web/build.mjs')], { stdio: 'inherit' });

const cfg = JSON.parse(readFileSync(process.env.GATEWAY_CONFIG ?? join(import.meta.dirname, '../gateway.config.live.json'), 'utf8')) as GatewayConfig;
// Customer B's infrastructure: the real kind cluster when it is up (infra/kind/up.sh), else the simulation.
// MGATE_INFRA=k8s|mock forces one.
const kindUp = () => {
  try {
    execFileSync(join(process.env.HOME ?? '', '.local/bin/kubectl'), ['--context', DEFAULT_K8S.context, '-n', DEFAULT_K8S.namespace, 'get', 'deploy', 'payments'], { stdio: 'ignore', timeout: 10_000 });
    return true;
  } catch { return false; }
};
const infra = process.env.MGATE_INFRA ?? (kindUp() ? 'k8s' : 'mock');
if (infra === 'k8s') {
  await startK8sOps(7401);
  console.log(`customer infrastructure: Kubernetes ${DEFAULT_K8S.context}, namespace ${DEFAULT_K8S.namespace} (ops API on http://127.0.0.1:7401)`);
} else {
  await startMockOps(7401);
  console.log('customer infrastructure (simulated) on http://127.0.0.1:7401  (run infra/kind/up.sh for the real cluster)');
}
const { index, gw } = await startGateway(cfg, 7400, { startHeight: BigInt(m.anchorHeight) - 2n });
gw.watchWorkOrder(WorkOrderSchema.parse(JSON.parse(readFileSync(join(root, '.data/work-orders/current.json'), 'utf8'))));
const owner = cfg.mandates!.trustedIssuers[0];
process.stdout.write(`reading testnet from height ${BigInt(m.anchorHeight) - 2n} for work order ${m.hash.slice(0, 12)}…`);
for (let i = 0; i < 300; i++) {
  const st = index!.status(m.hash, owner).status;
  if (st === 'active' || st === 'revoked') { console.log(` ${st}.`); break; }
  await new Promise((r) => setTimeout(r, 1000));
}
console.log('\nReady. Dashboard: http://127.0.0.1:7400/dashboard\nOpen Claude Code in demo/claude-agent and give it the incident. Ctrl+C to stop.\n');
