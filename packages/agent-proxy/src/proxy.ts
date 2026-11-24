import { z } from 'zod';
import type { Hex } from 'viem';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import {
  TOOLS, resourceFor, signRequest, paramsHash, newRequestId, workOrderHash,
  CCD_TESTNET_CAIP2, CIS8004_CONTRACT, AGENT_KEY_NAMESPACE, AGENT_KEY_TYPE,
  type AgentRequest, type ToolDef, type WorkOrder,
} from '@mandate-gate/core';

export interface ProxyConfig {
  gatewayUrl: string; // e.g. http://127.0.0.1:7400/mcp
  audience: string; // must match the gateway
  agentTokenId: string;
  agentAddress: string;
  privateKey: Hex; // the agent's EVM key; never exposed to the agent/LLM
  workOrder?: WorkOrder; // L2 mandate carried with every call
  runtime?: { model?: string; version?: string };
  ttlSeconds?: number;
}

/** Builds and signs the envelope for one tool call. Exported for tests and scripts. */
export async function signedCall(cfg: ProxyConfig, tool: ToolDef, params: Record<string, unknown>) {
  const now = Math.floor(Date.now() / 1000);
  const request: AgentRequest = {
    v: 1,
    audience: cfg.audience,
    agent: {
      network: CCD_TESTNET_CAIP2,
      registry: { index: String(CIS8004_CONTRACT.index), subindex: String(CIS8004_CONTRACT.subindex) },
      tokenId: cfg.agentTokenId,
      key: { namespace: AGENT_KEY_NAMESPACE, keyType: AGENT_KEY_TYPE, address: cfg.agentAddress },
    },
    workOrderHash: cfg.workOrder ? workOrderHash(cfg.workOrder) : null,
    action: tool.action,
    resource: resourceFor(params as { service?: string }),
    paramsHash: paramsHash(params),
    requestId: newRequestId(),
    issuedAt: now,
    expiresAt: now + (cfg.ttlSeconds ?? 30),
    ...(cfg.runtime ? { agentRuntime: cfg.runtime } : {}),
  };
  const signed = await signRequest(request, cfg.privateKey);
  return cfg.workOrder ? { ...signed, workOrder: cfg.workOrder } : signed;
}

export async function connectGateway(url: string): Promise<Client> {
  const client = new Client({ name: 'mandate-gate-agent-proxy', version: '0.1.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(url)));
  return client;
}

/** The MCP server the agent sees: same tools as the gateway, minus the auth field. */
export function buildProxyServer(cfg: ProxyConfig): McpServer {
  const mcp = new McpServer({ name: 'mandate-gate-agent-proxy', version: '0.1.0' });
  let client: Client | undefined;
  for (const tool of TOOLS) {
    mcp.registerTool(tool.name, {
      title: tool.action,
      description: `${tool.description} Calls go through the customer's MandateGate gateway, which checks this agent's Concordium identity and mandate.`,
      inputSchema: tool.params,
    }, async (params) => {
      client ??= await connectGateway(cfg.gatewayUrl);
      const auth = await signedCall(cfg, tool, params as Record<string, unknown>);
      const out = await client.callTool({ name: tool.name, arguments: { params, auth } });
      return out as { content: Array<{ type: 'text'; text: string }>; isError?: boolean };
    });
  }
  return mcp;
}
