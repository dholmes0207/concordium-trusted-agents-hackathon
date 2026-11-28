import { z } from 'zod';
import type { Hex } from 'viem';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { ExactConcordiumScheme } from '@x402/concordium/exact/client';
import type { PaymentPayload, PaymentRequirements } from '@x402/core/types';
import type { AccountAddress, AccountSigner } from '@concordium/web-sdk';
import {
  TOOLS, resourceFor, signRequest, paramsHash, newRequestId, workOrderHash,
  CCD_TESTNET_CAIP2, CIS8004_CONTRACT, AGENT_KEY_NAMESPACE, AGENT_KEY_TYPE,
  delegationHash, type SignedDelegation,
  type AgentRequest, type ToolDef, type WorkOrder,
} from '@mandate-gate/core';

export interface ProxyConfig {
  gatewayUrl: string; // e.g. http://127.0.0.1:7400/mcp
  audience: string; // must match the gateway
  agentTokenId: string;
  agentAddress: string;
  privateKey: Hex; // the agent's EVM key; never exposed to the agent/LLM
  workOrder?: WorkOrder; // L2 mandate carried with every call
  /** For a sub-agent: the signed delegations from the root work order down to this agent. */
  delegations?: SignedDelegation[];
  runtime?: { model?: string; version?: string };
  ttlSeconds?: number;
  /** x402: the agent wallet that pays for level-2 actions (key stays in the proxy). */
  payer?: { accountAddress: AccountAddress.Type; signer: AccountSigner };
  /** Local stop rule: never pay more than this per proxy run (microCCD), on top of the gateway's budget check. */
  maxSpendMicroCcd?: bigint;
}

/** Builds and signs the envelope for one tool call. Exported for tests and scripts. */
export async function signedCall(cfg: ProxyConfig, tool: ToolDef, params: Record<string, unknown>, payment?: PaymentPayload) {
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
    // The request names the link the agent acts under: the last delegation, or the work order itself.
    workOrderHash: cfg.delegations?.length ? delegationHash(cfg.delegations[cfg.delegations.length - 1].delegation)
      : cfg.workOrder ? workOrderHash(cfg.workOrder) : null,
    action: tool.action,
    resource: resourceFor(params as { service?: string }),
    paramsHash: paramsHash(params),
    requestId: newRequestId(),
    issuedAt: now,
    expiresAt: now + (cfg.ttlSeconds ?? 30),
    ...(cfg.runtime ? { agentRuntime: cfg.runtime } : {}),
  };
  const signed = await signRequest(request, cfg.privateKey);
  return { ...signed, ...(cfg.workOrder ? { workOrder: cfg.workOrder } : {}),
    ...(cfg.delegations?.length ? { delegations: cfg.delegations } : {}), ...(payment ? { payment } : {}) };
}

type Out = { content: Array<{ type: 'text'; text: string }>; isError?: boolean };

/**
 * x402 client side: builds the agent wallet's sponsored transfer for the gateway's requirements.
 * Refuses (stop rule) if the work order's budget or the local cap would be exceeded.
 */
export async function payFor(cfg: ProxyConfig, answer: { accepts: PaymentRequirements[]; budget?: { maxMicroCcd: string; spentMicroCcd: string } }, spentLocally: bigint): Promise<PaymentPayload | string> {
  if (!cfg.payer) return 'no_payer_configured';
  const req = answer.accepts.find((a) => a.scheme === 'exact' && a.network.startsWith('ccd:') && (a.asset === 'CCD' || !a.asset));
  if (!req) return 'no_supported_payment_option';
  const amount = BigInt(req.amount);
  if (answer.budget && BigInt(answer.budget.spentMicroCcd) + amount > BigInt(answer.budget.maxMicroCcd)) return 'budget_exceeded';
  if (cfg.maxSpendMicroCcd !== undefined && spentLocally + amount > cfg.maxSpendMicroCcd) return 'local_spend_cap_reached';
  const scheme = new ExactConcordiumScheme({ accountAddress: cfg.payer.accountAddress, signer: cfg.payer.signer });
  const p = await scheme.createPaymentPayload(2, req);
  return { x402Version: 2, accepted: req, payload: p.payload };
}

/** One tool call through the gateway, paying once if the gateway asks for it. */
export async function callThroughGateway(client: Client, cfg: ProxyConfig, tool: ToolDef, params: Record<string, unknown>, state = { spent: 0n }): Promise<Out> {
  const send = async (payment?: PaymentPayload) => (await client.callTool(
    { name: tool.name, arguments: { params, auth: await signedCall(cfg, tool, params, payment) } }, undefined, { timeout: APPROVAL_WAIT_MS })) as Out;
  const first = await send();
  let body: { status?: string; accepts?: PaymentRequirements[]; budget?: { maxMicroCcd: string; spentMicroCcd: string } };
  try { body = JSON.parse(first.content[0]?.text ?? '{}'); } catch { return first; }
  if (body.status !== 'payment_required' || !body.accepts) return first;
  const payment = await payFor(cfg, { accepts: body.accepts, budget: body.budget }, state.spent);
  if (typeof payment === 'string') {
    return { content: [{ type: 'text', text: JSON.stringify({ status: 'denied', reason: payment, payment: body }) }], isError: true };
  }
  const second = await send(payment);
  try { if (JSON.parse(second.content[0]?.text ?? '{}').status === 'ok') state.spent += BigInt(payment.accepted.amount); } catch { /* keep the answer */ }
  return second;
}

export async function connectGateway(url: string): Promise<Client> {
  const client = new Client({ name: 'mandate-gate-agent-proxy', version: '0.1.0' });
  await client.connect(new StreamableHTTPClientTransport(new URL(url)));
  return client;
}

/** The MCP server the agent sees: same tools as the gateway, minus the auth field. */
/** How long the proxy waits for a held call: approval hold (300 s) + anchors + margin. */
export const APPROVAL_WAIT_MS = Number(process.env.MGATE_CALL_TIMEOUT_MS ?? 420_000);

export function buildProxyServer(cfg: ProxyConfig): McpServer {
  const mcp = new McpServer({ name: 'mandate-gate-agent-proxy', version: '0.1.0' });
  let client: Client | undefined;
  const spend = { spent: 0n };
  for (const tool of TOOLS) {
    mcp.registerTool(tool.name, {
      title: tool.action,
      description: `${tool.description} Calls go through the customer's MandateGate gateway, which checks this agent's Concordium identity and mandate.`,
      inputSchema: tool.params,
    }, async (params) => {
      client ??= await connectGateway(cfg.gatewayUrl);
      // Level-2 actions can be held for human approval (up to 5 min), paid (x402) and anchored on chain.
      return callThroughGateway(client, cfg, tool, params as Record<string, unknown>, spend);
    });
  }
  return mcp;
}
