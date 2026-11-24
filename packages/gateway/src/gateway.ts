import { createServer, type IncomingMessage, type Server } from 'node:http';
import { join } from 'node:path';
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import {
  TOOLS, resourceFor, verifyEnvelope, requestHash, RequestLedger, AuditLog,
  WorkOrderSchema, workOrderHash, checkScope,
  type SignedRequest, type ToolDef, type WorkOrder,
} from '@mandate-gate/core';
import { MandateIndex } from './mandates.js';

export interface TrustedAgent { tokenId: string; address: string; owner?: string }

export interface GatewayConfig {
  audience: string; // e.g. "mgate:customer-b"
  mockOpsUrl: string; // e.g. http://127.0.0.1:7401
  dataDir: string; // ledger + audit files
  /** Agents pinned in config until the on-chain L1 checks land (spike S0). */
  trustedAgents: TrustedAgent[];
  maxBodyBytes?: number;
  /** L2: when set, every request must carry an anchored, unrevoked work order from a trusted issuer. */
  mandates?: { trustedIssuers: string[]; maxStalenessSeconds?: number };
}

export type Decision =
  | { status: 'ok'; result: unknown }
  | { status: 'denied'; reason: string }
  | { status: 'approval_required'; reason: string };

const authSchema = z.object({
  request: z.object({}).passthrough(),
  signature: z.string().regex(/^0x[0-9a-fA-F]{130}$/),
  workOrder: z.object({}).passthrough().optional(),
});

export type GatewayAuth = SignedRequest & { workOrder?: unknown };

export class Gateway {
  readonly ledger: RequestLedger;
  readonly audit: AuditLog;
  readonly mandates?: MandateIndex;
  private rate = new Map<string, number[]>(); // `${woHash}|${action}` -> timestamps (ms)

  constructor(readonly cfg: GatewayConfig, mandateIndex?: MandateIndex) {
    this.ledger = new RequestLedger(join(cfg.dataDir, 'requests.jsonl'));
    this.audit = new AuditLog(join(cfg.dataDir, 'audit.jsonl'));
    if (cfg.mandates) {
      this.mandates = mandateIndex ?? new MandateIndex(new Set(cfg.mandates.trustedIssuers), cfg.mandates.maxStalenessSeconds ?? 30);
    }
  }

  /** L2 (V3): work order present, matches the request, anchored, not revoked, fresh, in scope. */
  private checkMandate(tool: ToolDef, auth: GatewayAuth):
    { ok: true; wo: WorkOrder | null; woHash: string | null; needsApproval: boolean; maxPerHour?: number } | { ok: false; reason: string } {
    if (!this.mandates) return { ok: true, wo: null, woHash: null, needsApproval: tool.level === 2 };
    const parsed = WorkOrderSchema.safeParse(auth.workOrder);
    if (!parsed.success) return { ok: false, reason: 'work_order_missing_or_malformed' };
    const wo = parsed.data;
    const h = workOrderHash(wo);
    if (auth.request.workOrderHash !== h) return { ok: false, reason: 'work_order_hash_mismatch' };
    const st = this.mandates.status(h, wo.issuer.account);
    if (st.status === 'stale') return { ok: false, reason: 'revocation_status_stale' };
    if (st.status === 'revoked') return { ok: false, reason: 'work_order_revoked' };
    if (st.status === 'unknown') return { ok: false, reason: 'work_order_not_anchored' };
    const r = auth.request;
    const sc = checkScope(wo, { audience: this.cfg.audience, tokenId: r.agent.tokenId, keyAddress: r.agent.key.address, action: r.action, resource: r.resource });
    if (!sc.ok) return { ok: false, reason: `work_order_${sc.reason}` };
    // B's policy may only raise the bar: level 2 always needs approval.
    return { ok: true, wo, woHash: h, needsApproval: tool.level === 2 || sc.approval === 'required', maxPerHour: sc.maxPerHour };
  }

  private overRate(key: string, maxPerHour?: number): boolean {
    if (!maxPerHour) return false;
    const now = Date.now();
    const list = (this.rate.get(key) ?? []).filter((t) => now - t < 3_600_000);
    if (list.length >= maxPerHour) { this.rate.set(key, list); return true; }
    list.push(now); this.rate.set(key, list); return false;
  }

  /** The decision pipeline. Every branch writes an audit record before answering. */
  async handle(tool: ToolDef, params: Record<string, unknown>, auth: GatewayAuth): Promise<Decision & { auditSeq: number }> {
    const r = auth.request;
    const deny = (reason: string, extra: Record<string, unknown> = {}) => {
      const rec = this.audit.append('decision', { requestId: r?.requestId, action: tool.action, decision: 'deny', reason, ...extra });
      return { status: 'denied' as const, reason, auditSeq: rec.seq };
    };

    // L1: envelope (signature, audience, time window, params binding).
    const env = await verifyEnvelope(auth, { audience: this.cfg.audience, params });
    if (!env.ok) return deny(env.reason);
    if (r.action !== tool.action) return deny('action_mismatch');
    if (r.resource !== resourceFor(params as { service?: string })) return deny('resource_mismatch');

    // L1: agent identity. Pinned for now; replaced by the five on-chain checks + CIS-8 owner_of_key.
    const trusted = this.cfg.trustedAgents.find((a) => a.tokenId === r.agent.tokenId);
    if (!trusted) return deny('unknown_agent');
    if (trusted.address.toLowerCase() !== r.agent.key.address.toLowerCase()) return deny('key_not_bound_to_agent');

    // L2: mandate (negative tests #7 #8 #9 #10 #21).
    const m = this.checkMandate(tool, auth);
    if (!m.ok) return deny(m.reason);

    // L1: idempotency (negative test #17).
    const rh = requestHash(r);
    const res = this.ledger.reserve(r.requestId, rh, r.expiresAt);
    if (res !== 'reserved') return deny(res === 'duplicate' ? 'replayed_request' : 'request_id_conflict');

    this.audit.append('request', {
      requestId: r.requestId, requestHash: rh, agent: r.agent.tokenId, action: r.action, resource: r.resource,
      workOrderHash: r.workOrderHash, agentRuntime: r.agentRuntime ?? null,
    });

    if (m.woHash && this.overRate(`${m.woHash}|${tool.action}`, m.maxPerHour)) {
      this.ledger.finish(r.requestId, 'failed');
      return deny('rate_limited');
    }

    // L3 (approval) comes next; actions that need approval are held until it is wired.
    if (m.needsApproval) {
      this.ledger.finish(r.requestId, 'failed');
      const rec = this.audit.append('decision', { requestId: r.requestId, action: tool.action, decision: 'needs_approval', reason: 'approval_flow_not_enabled' });
      return { status: 'approval_required', reason: 'approval_flow_not_enabled', auditSeq: rec.seq };
    }

    // Fail-closed: the allow decision must be durable before executing.
    this.audit.append('decision', { requestId: r.requestId, action: tool.action, decision: 'allow', level: tool.level, workOrderHash: m.woHash });
    try {
      const resp = await fetch(`${this.cfg.mockOpsUrl}/ops/${tool.action}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(params),
      });
      const body = (await resp.json()) as { ok: boolean; result?: unknown; error?: string };
      this.ledger.finish(r.requestId, body.ok ? 'done' : 'failed');
      const rec = this.audit.append('execution', { requestId: r.requestId, ok: body.ok, error: body.error ?? null });
      return body.ok ? { status: 'ok', result: body.result, auditSeq: rec.seq } : { status: 'denied', reason: `execution_failed: ${body.error}`, auditSeq: rec.seq };
    } catch (e) {
      this.ledger.finish(r.requestId, 'failed');
      const rec = this.audit.append('execution', { requestId: r.requestId, ok: false, error: 'infrastructure_unreachable' });
      return { status: 'denied', reason: 'infrastructure_unreachable', auditSeq: rec.seq };
    }
  }

  /** One MCP server per HTTP request (stateless streamable HTTP). */
  private buildMcp(): McpServer {
    const mcp = new McpServer({ name: 'mandate-gate', version: '0.1.0' });
    for (const tool of TOOLS) {
      mcp.registerTool(tool.name, {
        title: tool.action,
        description: `${tool.description} Requires a signed MandateGate request envelope in "auth".`,
        inputSchema: { params: z.object(tool.params).strict(), auth: authSchema },
      }, async ({ params, auth }) => {
        const out = await this.handle(tool, params as Record<string, unknown>, auth as unknown as GatewayAuth);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ ...out, auditHead: this.audit.headHash }) }],
          isError: out.status !== 'ok',
        };
      });
    }
    return mcp;
  }

  listen(port: number, host = '127.0.0.1'): Promise<Server> {
    const max = this.cfg.maxBodyBytes ?? 65_536;
    const server = createServer(async (req, res) => {
      if (req.url !== '/mcp') { res.writeHead(404).end(); return; }
      if (req.method !== 'POST') { res.writeHead(405).end(); return; }
      let body: unknown;
      try { body = await readJson(req, max); } catch (e) {
        // Negative test #23: oversized or malformed input is refused before parsing further.
        this.audit.append('decision', { decision: 'deny', reason: (e as Error).message });
        res.writeHead(413, { connection: 'close' }).end(); return;
      }
      const mcp = this.buildMcp();
      const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });
      res.on('close', () => { transport.close(); mcp.close(); });
      await mcp.connect(transport);
      await transport.handleRequest(req, res, body);
    });
    return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
  }
}

function readJson(req: IncomingMessage, max: number): Promise<unknown> {
  return new Promise((resolve, reject) => {
    let size = 0; const chunks: Buffer[] = [];
    let tooLarge = false;
    req.on('data', (c: Buffer) => {
      if (tooLarge) return; // drain the rest without buffering it
      size += c.length;
      if (size > max) { tooLarge = true; chunks.length = 0; reject(new Error('body_too_large')); } else chunks.push(c);
    });
    req.on('end', () => { if (tooLarge) return; try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new Error('malformed_json')); } });
    req.on('error', reject);
  });
}
