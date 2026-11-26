import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { readFileSync } from 'node:fs';
import { loadAgentKey, loadAccount, WorkOrderSchema } from '@mandate-gate/core';
import { buildProxyServer } from './proxy.js';

// Launched by the agent (HolmesGPT / Claude Code) as a stdio MCP server.
// Env: MGATE_GATEWAY_URL, MGATE_AUDIENCE, MGATE_AGENT_TOKEN_ID, MGATE_AGENT_KEY (key file name in ~/ccd-keys),
//      MGATE_WORK_ORDER (path to the work order JSON issued by company A)
//      MGATE_PAYER_KEY (x402: agent wallet export in ~/ccd-keys), MGATE_MAX_SPEND_MICRO_CCD (local cap)
const key = loadAgentKey(process.env.MGATE_AGENT_KEY ?? 'agent-evm');
const server = buildProxyServer({
  gatewayUrl: process.env.MGATE_GATEWAY_URL ?? 'http://127.0.0.1:7400/mcp',
  audience: process.env.MGATE_AUDIENCE ?? 'mgate:customer-b',
  agentTokenId: process.env.MGATE_AGENT_TOKEN_ID ?? 'unregistered',
  agentAddress: key.address,
  privateKey: key.privateKey,
  workOrder: process.env.MGATE_WORK_ORDER ? WorkOrderSchema.parse(JSON.parse(readFileSync(process.env.MGATE_WORK_ORDER, 'utf8'))) : undefined,
  runtime: { model: process.env.MGATE_AGENT_MODEL, version: process.env.MGATE_AGENT_VERSION },
  payer: process.env.MGATE_PAYER_KEY ? (() => { const a = loadAccount(process.env.MGATE_PAYER_KEY!); return { accountAddress: a.address, signer: a.signer }; })() : undefined,
  maxSpendMicroCcd: process.env.MGATE_MAX_SPEND_MICRO_CCD ? BigInt(process.env.MGATE_MAX_SPEND_MICRO_CCD) : undefined,
});
await server.connect(new StdioServerTransport());
