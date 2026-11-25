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
import type { AgentVerifier } from './agents.js';
import { AuditAnchorer, type AnchorSender } from './anchorer.js';
import type { ApprovalService, PendingApproval } from './approvals.js';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export interface TrustedAgent { tokenId: string; address: string; owner?: string }

export interface GatewayConfig {
  audience: string; // e.g. "mgate:customer-b"
  mockOpsUrl: string; // e.g. http://127.0.0.1:7401
  dataDir: string; // ledger + audit files
  /** Agents pinned in config until the on-chain L1 checks land (spike S0). */
  trustedAgents: TrustedAgent[];
  maxBodyBytes?: number;
  /** L2: when set, every request must carry an anchored, unrevoked work order from a trusted issuer. */
  mandates?: { trustedIssuers: string[]; maxStalenessSeconds?: number; startHeight?: number };
  /** L4: anchor the audit head on chain; level-2 actions wait for a finalized anchor of their decision. */
  audit?: { intervalSeconds?: number };
  /** L1 chain mode: owners (company A accounts) this customer has onboarded. */
  onboardedOwners?: string[];
  /** L3: public base URL of the approval pages (default http://127.0.0.1:<port>). */
  approvalBaseUrl?: string;
  /** L3: enable the approval flow (needs `gatewayAccountKey`). */
  approvals?: { holdSeconds?: number; idpIndexes?: number[] };
  /** Customer B's account key file in ~/ccd-keys (pays for VRA/VAA, audit anchors, sponsorship). */
  gatewayAccountKey?: string;
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
  readonly anchorer?: AuditAnchorer;
  private rate = new Map<string, number[]>(); // `${woHash}|${action}` -> timestamps (ms)
  /** Called when an approval is waiting (prints the link in the demo). */
  onApprovalPending?: (p: PendingApproval, url: string) => void;
  private baseUrl = '';

  constructor(readonly cfg: GatewayConfig, mandateIndex?: MandateIndex, private agentVerifier?: AgentVerifier,
    anchorSender?: AnchorSender, readonly approvals?: ApprovalService) {
    this.ledger = new RequestLedger(join(cfg.dataDir, 'requests.jsonl'));
    this.audit = new AuditLog(join(cfg.dataDir, 'audit.jsonl'));
    if (anchorSender) {
      this.anchorer = new AuditAnchorer(this.audit, anchorSender, join(cfg.dataDir, 'anchors.jsonl'));
      if (cfg.audit?.intervalSeconds) this.anchorer.startTimer(cfg.audit.intervalSeconds);
    }
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

    // L1: agent identity. With a verifier: on-chain checks (registry, active, card URL and bytes,
    // owner, CIS-8 key binding, onboarded owner), re-checked fresh before level-2 actions.
    // Without one (tests, offline demo): agents pinned in the config.
    if (this.agentVerifier) {
      const chk = await this.agentVerifier.verify(auth, { fresh: tool.level === 2 });
      if (!chk.ok) return deny(`agent_${chk.reasons[0]}`, { agentChecks: chk.reasons });
    } else {
      const trusted = this.cfg.trustedAgents.find((a) => a.tokenId === r.agent.tokenId);
      if (!trusted) return deny('unknown_agent');
      if (trusted.address.toLowerCase() !== r.agent.key.address.toLowerCase()) return deny('key_not_bound_to_agent');
    }

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

    let approvalId: string | undefined;
    if (m.needsApproval) {
      if (!this.approvals) {
        this.ledger.finish(r.requestId, 'failed');
        const rec = this.audit.append('decision', { requestId: r.requestId, action: tool.action, decision: 'needs_approval', reason: 'approval_flow_not_enabled' });
        return { status: 'approval_required', reason: 'approval_flow_not_enabled', auditSeq: rec.seq };
      }
      // L3: hold the action until a named engineer approves exactly this request (digest D).
      const p = await this.approvals.create({
        audience: this.cfg.audience, agentTokenId: r.agent.tokenId, workOrderHash: m.woHash ?? '',
        requestHash: rh, action: r.action, resource: r.resource, paramsHash: r.paramsHash,
      }, params, m.wo?.approval?.approverCommitment);
      approvalId = p.id;
      this.audit.append('approval_requested', { requestId: r.requestId, approvalId: p.id, digest: p.digest, vraTx: p.vraTx ?? null, status: p.status, reason: p.reason ?? null });
      if (p.status === 'pending') this.onApprovalPending?.(p, `${this.baseUrl}/approvals/${p.id}`);
      const done = await this.approvals.wait(p.id);
      if (done.status !== 'approved') {
        this.ledger.finish(r.requestId, 'failed');
        return deny(done.reason ?? `approval_${done.status}`, { approvalId: p.id });
      }
      this.audit.append('approval', { requestId: r.requestId, approvalId: p.id, digest: p.digest, approver: done.approver, vraTx: done.vraTx, vaaTx: done.vaaTx ?? null });
      // The work order may have been revoked while the action was held.
      const again = this.checkMandate(tool, auth);
      if (!again.ok) { this.ledger.finish(r.requestId, 'failed'); return deny(again.reason, { approvalId: p.id }); }
    }

    // Fail-closed: the allow decision must be durable before executing.
    this.audit.append('decision', { requestId: r.requestId, action: tool.action, decision: 'allow', level: tool.level, workOrderHash: m.woHash, approvalId: approvalId ?? null });
    // L4: level-2 actions run only after the allow decision (and its approval) is anchored on chain.
    if (this.anchorer && tool.level === 2) {
      try { await this.anchorer.anchorNow(); } catch (e) {
        this.ledger.finish(r.requestId, 'failed');
        return deny('audit_anchor_failed', { error: (e as Error).message.slice(0, 200) });
      }
    }
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
          content: [{ type: 'text' as const, text: JSON.stringify({ ...out, auditHead: this.audit.headHash,
            lastAnchor: this.anchorer?.lastFinalized ? { seq: this.anchorer.lastFinalized.seq, txHash: this.anchorer.lastFinalized.txHash } : null }) }],
          isError: out.status !== 'ok',
        };
      });
    }
    return mcp;
  }

  listen(port: number, host = '127.0.0.1'): Promise<Server> {
    const max = this.cfg.maxBodyBytes ?? 65_536;
    this.baseUrl = this.cfg.approvalBaseUrl ?? `http://${host}:${port}`;
    const server = createServer(async (req, res) => {
      if (req.url?.startsWith('/approvals') || req.url === '/approve.js') { await this.approvalRoutes(req, res, max); return; }
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
    // Approval holds last up to the hold time; Node's default 300 s request timeout would cut them.
    server.requestTimeout = 0;
    return new Promise((resolve) => server.listen(port, host, () => resolve(server)));
  }

  /** L3 approval pages: list, page, data, presentation, reject, and the wallet client bundle. */
  private async approvalRoutes(req: IncomingMessage, res: import('node:http').ServerResponse, max: number) {
    const send = (code: number, body: unknown, type = 'application/json') =>
      res.writeHead(code, { 'content-type': type, 'cache-control': 'no-store' }).end(type === 'application/json' ? JSON.stringify(body) : String(body));
    if (!this.approvals) return send(404, { error: 'approvals_disabled' });
    const url = new URL(req.url!, 'http://x');
    const parts = url.pathname.split('/').filter(Boolean); // approvals, id, sub
    if (url.pathname === '/approve.js') {
      if (!existsSync(WEB_BUNDLE)) return send(503, '// run: pnpm --filter @mandate-gate/gateway build:web', 'text/javascript');
      return send(200, readFileSync(WEB_BUNDLE, 'utf8'), 'text/javascript');
    }
    if (parts.length === 1 && req.method === 'GET') return send(200, this.approvals.list().map(publicView));
    const p = this.approvals.get(parts[1] ?? '');
    if (!p) return send(404, { error: 'unknown_approval' });
    if (parts.length === 2 && req.method === 'GET') return send(200, APPROVAL_PAGE, 'text/html; charset=utf-8');
    if (parts[2] === 'data' && req.method === 'GET') return send(200, { ...publicView(p), request: p.requestJson ?? null, needsSalt: !!p.approverCommitment });
    if (parts[2] === 'reject' && req.method === 'POST') return send(200, publicView(this.approvals.reject(p.id)!));
    if (parts[2] === 'presentation' && req.method === 'POST') {
      let body: { presentation?: unknown; salt?: string };
      try { body = (await readJson(req, max * 4)) as typeof body; } catch (e) { return send(413, { error: (e as Error).message }); }
      const out = await this.approvals.submit(p.id, body.presentation, body.salt);
      return send(200, publicView(out));
    }
    return send(405, { error: 'method_not_allowed' });
  }
}

const WEB_BUNDLE = fileURLToPath(new URL('../dist-web/approve.js', import.meta.url));

function publicView(p: PendingApproval) {
  return { id: p.id, status: p.status, reason: p.reason ?? null, digest: p.digest, subject: p.subject, params: p.params,
    consent: p.consent, vraTx: p.vraTx ?? null, vaaTx: p.vaaTx ?? null, approver: p.approver ?? null };
}

const APPROVAL_PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MandateGate approval</title><style>
:root{color-scheme:light dark;--bg:#f7f7f5;--fg:#1d1d1b;--muted:#6b6b66;--card:#fff;--line:#deded8;--accent:#0b5fff;--danger:#b42318}
@media (prefers-color-scheme:dark){:root{--bg:#141413;--fg:#ececea;--muted:#9a9a94;--card:#1f1f1d;--line:#34342f;--accent:#6b9bff;--danger:#f97066}}
body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.5 system-ui,sans-serif}
main{max-width:720px;margin:0 auto;padding:24px 16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:16px;margin:16px 0}
h1{font-size:22px;margin:0 0 4px} .muted{color:var(--muted);font-size:14px}
pre{white-space:pre-wrap;word-break:break-all;font-size:12px;margin:0}
button{font:inherit;padding:10px 18px;border-radius:8px;border:1px solid var(--line);cursor:pointer;margin-right:8px}
#approve{background:var(--accent);color:#fff;border-color:var(--accent)} #reject{color:var(--danger);background:transparent}
button:disabled{opacity:.45;cursor:default} #warn{color:var(--danger)}
</style></head><body><main>
<h1>Approve a held action</h1><p class="muted">MandateGate holds this action until a named engineer approves it with a Concordium Verify &amp; Access proof. Your wallet does not show the details below, so read them here.</p>
<div class="card"><strong id="consent">Loading…</strong></div>
<p><button id="approve" disabled>Approve with Concordium wallet</button><button id="reject" disabled>Reject</button></p>
<p id="status" class="muted"></p><p id="warn"></p>
<p class="muted"><a id="vra" target="_blank" rel="noopener">Anchored request (VRA)</a> · <a id="vaa" target="_blank" rel="noopener" hidden>Audit anchor (VAA)</a></p>
<div class="card"><pre id="fields"></pre></div>
</main><script type="module" src="/approve.js"></script></body></html>`;

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
