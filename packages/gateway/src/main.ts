import { readFileSync } from 'node:fs';
import { Gateway, type GatewayConfig } from './gateway.js';
import { MandateIndex, pollingChainSource } from './mandates.js';
import { RegistryAgentVerifier } from './agents.js';
import { CCD_GRPC } from '@mandate-gate/core';

// Usage: GATEWAY_CONFIG=gateway.config.json pnpm start
const cfg = JSON.parse(readFileSync(process.env.GATEWAY_CONFIG ?? 'gateway.config.json', 'utf8')) as GatewayConfig;
const port = Number(process.env.GATEWAY_PORT ?? 7400);
// Chain mode when the config lists onboarded owners / trusted work-order issuers.
const verifier = cfg.onboardedOwners?.length ? new RegistryAgentVerifier(new Set(cfg.onboardedOwners)) : undefined;
let index: MandateIndex | undefined;
if (cfg.mandates) {
  index = new MandateIndex(new Set(cfg.mandates.trustedIssuers), cfg.mandates.maxStalenessSeconds ?? 30);
  const src = await pollingChainSource(CCD_GRPC.host, CCD_GRPC.port);
  index.follow(src, cfg.mandates.startHeight !== undefined ? BigInt(cfg.mandates.startHeight) : undefined)
    .catch((e) => console.error('chain follower stopped (gateway now fails closed):', e.message));
}
await new Gateway(cfg, index, verifier).listen(port);
console.log(`MandateGate listening on http://127.0.0.1:${port}/mcp (audience ${cfg.audience})`);
