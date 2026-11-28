import { z } from 'zod';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
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
  delegationHash, signDelegation, checkAttenuation, newDelegationNonce,
  type SignedDelegation, type Delegation, type Grant,
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
  /** Company A's sub-agents this agent may hand work to (public registry info), and where delegations are written. */
  subAgents?: SubAgent[];
  delegationsDir?: string;
}

export interface SubAgent { name: string; tokenId: string; keyAddress: string; description?: string }
export interface DelegationFile { workOrder: WorkOrder; delegations: SignedDelegation[] }

/**
 * Hands part of this agent's mandate to a sub-agent: builds a delegation that only narrows the current
 * link (root work order or last delegation), checks it locally, signs it with this agent's key and
 * writes the full chain for the sub-agent. The gateway checks it again on every call.
 */
export async function delegateTask(cfg: ProxyConfig, input: {
  subAgent: string; purpose: string; minutes: number;
  allow: Array<{ action: string; services: string[]; maxPerHour?: number }>; budgetCcd?: number;
}): Promise<{ file: string; hash: string; delegation: Delegation }> {
  if (!cfg.workOrder) throw new Error('no work order: nothing to delegate');
  const sub = cfg.subAgents?.find((a) => a.name === input.subAgent || a.tokenId === input.subAgent);
  if (!sub) throw new Error(`unknown sub-agent ${input.subAgent}; known: ${(cfg.subAgents ?? []).map((a) => a.name).join(', ')}`);
  const chain = cfg.delegations ?? [];
  const parent: Grant = chain.length ? chain[chain.length - 1].delegation : cfg.workOrder;
  const parentHash = chain.length ? delegationHash(chain[chain.length - 1].delegation) : workOrderHash(cfg.workOrder);
  const parentDepth = chain.length ? chain[chain.length - 1].delegation.depth : 0;
  const now = Math.floor(Date.now() / 1000);
  const actions = input.allow.map((a) => {
    // Inherit the parent's approval requirement and rate limit, which a delegation may only tighten.
    const p = parent.scope.actions.find((x) => x.action === a.action);
    const maxPerHour = a.maxPerHour ?? p?.maxPerHour;
    return { action: a.action, resources: a.services.map((s) => (s.startsWith('svc:') ? s : `svc:${s}`)),
      approval: p?.approval ?? 'required' as const, ...(maxPerHour ? { maxPerHour: Math.min(maxPerHour, p?.maxPerHour ?? maxPerHour) } : {}) };
  });
  const d: Delegation = {
    v: 1, kind: 'delegation', id: `dl_${new Date().toISOString().slice(0, 10).replace(/-/g, '')}_${newDelegationNonce().slice(0, 6)}`,
    parent: parentHash, depth: parentDepth + 1, audience: cfg.audience,
    delegator: { tokenId: cfg.agentTokenId, keyAddress: cfg.agentAddress }, agent: { tokenId: sub.tokenId, keyAddress: sub.keyAddress },
    scope: { actions }, ...(input.budgetCcd ? { budget: { maxSpendMicroCcd: String(Math.round(input.budgetCcd * 1e6)) } } : {}),
    purpose: input.purpose.slice(0, 200), notBefore: now - 5,
    expiresAt: Math.min(now + input.minutes * 60, parent.expiresAt), nonce: newDelegationNonce(),
  };
  const left = parent.budget ? BigInt(parent.budget.maxSpendMicroCcd) : null;
  const att = checkAttenuation(parent, parentHash, parentDepth, cfg.workOrder.delegation?.maxDepth, d, left);
  if (!att.ok) throw new Error(att.reason);
  const sd = await signDelegation(d, cfg.privateKey);
  const dir = cfg.delegationsDir ?? '.data/delegations';
  mkdirSync(dir, { recursive: true });
  const body: DelegationFile = { workOrder: cfg.workOrder, delegations: [...chain, sd] };
  writeFileSync(join(dir, `${d.id}.json`), JSON.stringify(body, null, 2));
  const file = join(dir, `current-${sub.name}.json`);
  writeFileSync(file, JSON.stringify(body, null, 2));
  return { file, hash: delegationHash(d), delegation: d };
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
  if (cfg.subAgents?.length) {
    mcp.registerTool('delegate_task', {
      title: 'delegate',
      description: `Hand a narrower part of your mandate to one of company A's registered sub-agents (${cfg.subAgents.map((a) => `${a.name} = agent #${a.tokenId}`).join('; ')}). `
        + 'You sign a delegation that can only narrow what you were given (fewer actions or services, stricter limits, shorter time); '
        + "the customer's gateway checks it on every call the sub-agent makes, and it stops if your work order is revoked or stopped.",
      inputSchema: {
        subAgent: z.string().describe('Sub-agent name, e.g. payments-watcher'),
        purpose: z.string().max(200).describe('One sentence: what the sub-agent should do'),
        minutes: z.number().int().min(1).max(240).describe('How long the delegation lasts'),
        allow: z.array(z.object({
          action: z.enum(TOOLS.map((t) => t.action) as [string, ...string[]]),
          services: z.array(z.string()).min(1).max(8),
          maxPerHour: z.number().int().min(1).max(100).optional(),
        })).min(1).max(8).describe('Actions and services the sub-agent may use'),
        budgetCcd: z.number().min(0).max(100).optional().describe('x402 budget for the sub-agent, if it may pay for level-2 actions'),
      },
    }, async (input) => {
      try {
        const r = await delegateTask(cfg, input as Parameters<typeof delegateTask>[1]);
        return { content: [{ type: 'text' as const, text: JSON.stringify({ status: 'delegated', subAgent: input.subAgent, agent: r.delegation.agent.tokenId,
          delegationHash: r.hash, expiresAt: new Date(r.delegation.expiresAt * 1000).toISOString(), scope: r.delegation.scope, budget: r.delegation.budget ?? null }) }] };
      } catch (e) {
        return { content: [{ type: 'text' as const, text: JSON.stringify({ status: 'denied', reason: (e as Error).message }) }], isError: true };
      }
    });
  }
  return mcp;
}
