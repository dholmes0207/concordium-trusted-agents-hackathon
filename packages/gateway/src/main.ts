import { readFileSync } from 'node:fs';
import type { GatewayConfig } from './gateway.js';
import { startGateway } from './run.js';

// Usage: GATEWAY_CONFIG=gateway.config.json [MGATE_START_HEIGHT=<height>] pnpm start
const cfg = JSON.parse(readFileSync(process.env.GATEWAY_CONFIG ?? 'gateway.config.json', 'utf8')) as GatewayConfig;
await startGateway(cfg, Number(process.env.GATEWAY_PORT ?? 7400),
  { startHeight: process.env.MGATE_START_HEIGHT ? BigInt(process.env.MGATE_START_HEIGHT) : undefined });
