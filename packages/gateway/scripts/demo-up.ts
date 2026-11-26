// One command for the live demo: customer B's simulated infrastructure + MandateGate (chain mode,
// L1–L4) reading testnet from the current work order's anchor height.
//   pnpm demo:up            (after `pnpm --filter @mandate-gate/issuer wo issue --sponsor`)
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { startMockOps } from '@mandate-gate/mock-ops';
import type { GatewayConfig } from '../src/gateway.js';
import { startGateway } from '../src/run.js';

const root = join(import.meta.dirname, '../../..');
const meta = join(root, '.data/work-orders/current.meta.json');
if (!existsSync(meta)) { console.error('No current work order. Run: pnpm --filter @mandate-gate/issuer wo issue --hours 3 --sponsor'); process.exit(1); }
const m = JSON.parse(readFileSync(meta, 'utf8')) as { hash: string; anchorHeight: string; anchorTx: string };
execFileSync('node', [join(import.meta.dirname, '../web/build.mjs')], { stdio: 'inherit' });

const cfg = JSON.parse(readFileSync(process.env.GATEWAY_CONFIG ?? join(import.meta.dirname, '../gateway.config.live.json'), 'utf8')) as GatewayConfig;
await startMockOps(7401);
console.log('customer infrastructure (simulated) on http://127.0.0.1:7401');
const { index } = await startGateway(cfg, 7400, { startHeight: BigInt(m.anchorHeight) - 2n });
const owner = cfg.mandates!.trustedIssuers[0];
process.stdout.write(`reading testnet from height ${BigInt(m.anchorHeight) - 2n} for work order ${m.hash.slice(0, 12)}…`);
for (let i = 0; i < 300; i++) {
  const st = index!.status(m.hash, owner).status;
  if (st === 'active' || st === 'revoked') { console.log(` ${st}.`); break; }
  await new Promise((r) => setTimeout(r, 1000));
}
console.log('\nReady. Open Claude Code in demo/claude-agent and give it the incident. Ctrl+C to stop.\n');
