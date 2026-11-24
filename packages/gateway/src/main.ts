import { readFileSync } from 'node:fs';
import { Gateway, type GatewayConfig } from './gateway.js';

// Usage: GATEWAY_CONFIG=gateway.config.json pnpm start
const cfg = JSON.parse(readFileSync(process.env.GATEWAY_CONFIG ?? 'gateway.config.json', 'utf8')) as GatewayConfig;
const port = Number(process.env.GATEWAY_PORT ?? 7400);
await new Gateway(cfg).listen(port);
console.log(`MandateGate listening on http://127.0.0.1:${port}/mcp (audience ${cfg.audience})`);
