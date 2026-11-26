/** Customer B's live dashboard, served by the gateway at /dashboard (no build step, no external assets). */
export const DASHBOARD_HTML = String.raw`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>MandateGate dashboard</title>
<style>
:root{--bg:#f6f6f3;--card:#fff;--fg:#1c1c1a;--muted:#6a6a64;--line:#e2e2dc;--ok:#137a3e;--okbg:#e5f4ea;--bad:#b42318;--badbg:#fdecea;--wait:#9a6700;--waitbg:#fff4d6;--acc:#0b5fff;--accbg:#e8efff;--mono:ui-monospace,SFMono-Regular,Menlo,monospace}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#121211;--card:#1c1c1a;--fg:#ececea;--muted:#9a9a93;--line:#30302c;--ok:#4ade80;--okbg:#12301d;--bad:#f97066;--badbg:#3a1714;--wait:#fbbf24;--waitbg:#3a2c0a;--acc:#7aa2ff;--accbg:#18223d}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
header{display:flex;flex-wrap:wrap;gap:8px 20px;align-items:baseline;padding:16px 20px;border-bottom:1px solid var(--line);background:var(--card);position:sticky;top:0;z-index:2}
header h1{font-size:18px;margin:0}header .meta{color:var(--muted);font-size:13px}
.live{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--muted);margin-right:6px}.live.on{background:var(--ok)}
main{max-width:1180px;margin:0 auto;padding:16px 16px 48px;display:grid;grid-template-columns:minmax(0,380px) minmax(0,1fr);gap:16px}
@media (max-width:900px){main{grid-template-columns:1fr}}
section h2{font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted);margin:8px 0}
.card{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:12px}
.row{display:flex;justify-content:space-between;gap:8px;align-items:center}
.chip{font-size:12px;padding:2px 8px;border-radius:999px;white-space:nowrap;font-weight:600}
.ok{color:var(--ok);background:var(--okbg)}.bad{color:var(--bad);background:var(--badbg)}.wait{color:var(--wait);background:var(--waitbg)}.info{color:var(--acc);background:var(--accbg)}
.mono{font-family:var(--mono);font-size:12px}.muted{color:var(--muted)}.small{font-size:13px}
.meter{height:8px;background:var(--line);border-radius:999px;overflow:hidden;margin:6px 0}.meter>i{display:block;height:100%;background:var(--acc)}
ul.scope{margin:6px 0 0;padding-left:18px;font-size:13px}
button{font:inherit;font-weight:600;padding:8px 12px;border-radius:8px;border:1px solid var(--bad);background:transparent;color:var(--bad);cursor:pointer;width:100%;margin-top:10px}
button:disabled{opacity:.45;cursor:default}
a{color:var(--acc)}a.btn{display:block;text-align:center;padding:8px;border-radius:8px;background:var(--acc);color:#fff;text-decoration:none;font-weight:600;margin-top:8px}
.ev{display:grid;grid-template-columns:64px minmax(0,1fr);gap:10px;padding:12px 14px;border-bottom:1px solid var(--line)}.ev:last-child{border-bottom:0}
.ev .t{color:var(--muted);font-size:12px;font-family:var(--mono);padding-top:2px}
.ev .title{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center}.ev .title b{font-family:var(--mono);font-size:14px}
.steps{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
.step{font-size:12px;border:1px solid var(--line);border-radius:6px;padding:2px 7px;display:inline-flex;gap:5px;align-items:center}
.step.ok{border-color:transparent}.step.bad{border-color:transparent}.step.wait{border-color:transparent}
.reason{margin-top:6px;font-size:13px;color:var(--bad)}.result{margin-top:6px;font-size:13px;color:var(--muted)}
.empty{padding:24px;text-align:center;color:var(--muted)}
</style></head><body>
<header><h1>MandateGate · customer B</h1>
<span class="meta"><span id="live" class="live"></span><span id="aud"></span></span>
<span class="meta">chain height <span id="height" class="mono">–</span></span>
<span class="meta">last audit anchor <span id="anchor">–</span></span></header>
<main>
<div>
<section><h2>Work orders</h2><div id="wos"><div class="card muted small">No work order seen yet. They appear with the agent's first request.</div></div></section>
<section><h2>Waiting for approval</h2><div id="pending"><div class="card muted small">Nothing waiting.</div></div></section>
</div>
<section><h2>Agent activity (live)</h2><div class="card" style="padding:0" id="feed"><div class="empty">No activity yet.</div></div></section>
</main>
<script>
const TX = 'https://ccdexplorer.io/testnet/transaction/';
const $ = (s) => document.querySelector(s);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const short = (h) => h ? esc(h.slice(0, 8)) + '…' : '';
const txl = (h, label) => h ? '<a target="_blank" rel="noopener" href="' + TX + esc(h) + '">' + esc(label || short(h)) + '</a>' : '';
const ccd = (micro) => (Number(micro) / 1e6).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' CCD';
const time = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const REASONS = {
  work_order_out_of_scope: 'Outside the work order: this action or service was not authorised.',
  work_order_revoked: 'The work order was revoked on chain by the agent\'s owner.',
  work_order_suspended_by_customer: 'Stopped by customer B (kill switch).',
  work_order_expired: 'The work order has expired.', work_order_not_anchored: 'The work order is not anchored on chain.',
  work_order_missing_or_malformed: 'No valid work order attached.', revocation_status_stale: 'Gateway cannot see recent blocks: failing closed.',
  approval_timeout: 'Nobody approved within 5 minutes.', rejected_by_approver: 'The engineer rejected it.',
  approval_interrupted_by_restart: 'The gateway restarted while this was waiting.',
  budget_exceeded: 'Work-order budget used up (x402 stop rule).', rate_limited: 'Rate limit of the work order reached.',
  agent_key_owner_differs_from_agent_owner: 'Signed by a key that does not belong to agent #1505\'s owner.',
  replayed_request: 'Replay of an earlier request.', audit_anchor_failed: 'Audit anchor not finalized: not executed.',
};

function group(records) {
  const groups = new Map(); const order = [];
  for (const r of records) {
    const d = r.data || {};
    const key = d.requestId || (d.approvalId ? 'ap:' + d.approvalId : 'seq:' + r.seq);
    if (!groups.has(key)) { groups.set(key, { key, recs: [] }); order.push(key); }
    groups.get(key).recs.push(r);
  }
  return order.reverse().map((k) => groups.get(k));
}

function render(state) {
  $('#aud').textContent = state.audience;
  $('#height').textContent = state.chain ? Number(state.chain.lastHeight).toLocaleString() : 'n/a';
  $('#anchor').innerHTML = state.lastAnchor ? 'seq ' + state.lastAnchor.seq + ' · ' + txl(state.lastAnchor.txHash) : 'none yet';
  const anchors = (state.anchors || []).filter((a) => a.status === 'finalized').sort((a, b) => a.seq - b.seq);
  const anchorFor = (seq) => anchors.find((a) => a.seq >= seq);

  // Work orders
  $('#wos').innerHTML = state.workOrders.length ? state.workOrders.map((w) => {
    const st = w.suspended ? '<span class="chip bad">stopped by customer</span>' : w.chainStatus === 'active' ? '<span class="chip ok">active on chain</span>'
      : '<span class="chip bad">' + esc(w.chainStatus) + '</span>';
    const left = w.expiresAt * 1000 - Date.now();
    const b = w.budget; const pct = b ? Math.min(100, 100 * Number(b.spentMicroCcd) / Number(b.maxMicroCcd)) : 0;
    return '<div class="card"><div class="row"><b class="mono">' + esc(w.id) + '</b>' + st + '</div>'
      + '<div class="small muted">agent #' + esc(w.agent) + ' · issued by <span class="mono">' + short(w.issuer) + '</span> · '
      + (left > 0 ? 'expires in ' + Math.round(left / 60000) + ' min' : 'expired') + '</div>'
      + (b ? '<div class="small" style="margin-top:8px">x402 budget: ' + ccd(b.spentMicroCcd) + ' of ' + ccd(b.maxMicroCcd) + '</div><div class="meter"><i style="width:' + pct + '%"></i></div>' : '')
      + '<ul class="scope">' + w.actions.map((a) => '<li><span class="mono">' + esc(a.action) + '</span> on ' + esc(a.resources.join(', ')) + (a.approval === 'required' ? ' · <span class="chip wait">approval</span>' : '') + '</li>').join('') + '</ul>'
      + '<button data-wo="' + esc(w.hash) + '" ' + (w.suspended ? 'disabled' : '') + '>' + (w.suspended ? 'Stopped' : 'Stop this agent now (kill switch)') + '</button></div>';
  }).join('') : '<div class="card muted small">No work order seen yet. They appear with the agent\'s first request.</div>';

  // Pending approvals
  $('#pending').innerHTML = state.pendingApprovals.length ? state.pendingApprovals.map((p) =>
    '<div class="card"><div class="small">' + esc(p.consent) + '</div><div class="small muted" style="margin-top:4px">expires ' + time(p.expiresAt * 1000)
    + (p.vraTx ? ' · request anchored ' + txl(p.vraTx) : '') + '</div><a class="btn" target="_blank" rel="noopener" href="/approvals/' + esc(p.id) + '">Review and approve</a></div>').join('')
    : '<div class="card muted small">Nothing waiting.</div>';

  // Activity
  const groups = group(state.records);
  $('#feed').innerHTML = groups.length ? groups.slice(0, 60).map((g) => {
    const by = (k, f) => g.recs.find((r) => r.kind === k && (!f || f(r.data)));
    const req = by('request'); const deny = by('decision', (d) => d.decision === 'deny'); const allow = by('decision', (d) => d.decision === 'allow');
    const payReq = by('decision', (d) => d.decision === 'payment_required'); const apReq = by('approval_requested'); const ap = by('approval');
    const pay = by('payment'); const exe = by('execution'); const rev = by('revocation');
    const first = g.recs[0];
    const action = (req && req.data.action) || first.data.action || (rev ? 'kill switch' : first.kind);
    const resource = req ? req.data.resource : '';
    let chip;
    if (rev) chip = '<span class="chip bad">work order stopped</span>';
    else if (deny) chip = '<span class="chip bad">denied</span>';
    else if (exe) chip = exe.data.ok ? '<span class="chip ok">done</span>' : '<span class="chip bad">failed</span>';
    else if (payReq) chip = '<span class="chip info">x402: payment asked</span>';
    else if (apReq && !ap) chip = '<span class="chip wait">waiting for approval</span>';
    else chip = '<span class="chip info">in progress</span>';
    const steps = [];
    if (req) { steps.push('<span class="step ok">✓ agent #' + esc(req.data.agent) + ' signed</span>', '<span class="step ok">✓ work order on chain</span>'); }
    if (payReq) steps.push('<span class="step info">' + ccd(payReq.data.amountMicroCcd) + ' requested · agent pays and retries</span>');
    if (apReq) steps.push('<span class="step ' + (ap ? 'ok' : deny ? 'bad' : 'wait') + '">' + (ap ? '✓' : deny ? '✕' : '…') + ' approval ' + txl(apReq.data.vraTx, 'request') + (ap ? ' · ' + txl(ap.data.vaaTx, 'verified') : '') + '</span>');
    if (pay) steps.push('<span class="step ok">✓ paid ' + ccd(pay.data.amountMicroCcd) + ' ' + txl(pay.data.txHash, 'tx') + '</span>');
    if (allow) { const a = anchorFor(allow.seq); steps.push('<span class="step ok">✓ allowed</span>'); if (a) steps.push('<span class="step ok">✓ anchored ' + txl(a.txHash) + '</span>'); }
    if (exe && exe.data.ok) steps.push('<span class="step ok">✓ executed</span>');
    if (rev) { const a = anchorFor(rev.seq); steps.push('<span class="step bad">customer B stopped work order ' + short(rev.data.workOrderHash) + '</span>' + (a ? '<span class="step ok">✓ anchored ' + txl(a.txHash) + '</span>' : '')); }
    const reason = deny ? '<div class="reason">' + esc(REASONS[deny.data.reason] || deny.data.reason) + ' <span class="mono muted">' + esc(deny.data.reason) + '</span></div>' : '';
    const runtime = req && req.data.agentRuntime && req.data.agentRuntime.model ? '<span class="muted small">via ' + esc(req.data.agentRuntime.model) + '</span>' : '';
    return '<div class="ev"><div class="t">' + time(first.at) + '</div><div><div class="title"><b>' + esc(action) + '</b><span class="mono muted">' + esc(resource) + '</span>' + chip + runtime + '</div>'
      + (steps.length ? '<div class="steps">' + steps.join('') + '</div>' : '') + reason + '</div></div>';
  }).join('') : '<div class="empty">No activity yet.</div>';
}

let timer;
async function refresh() { try { render(await (await fetch('/dashboard/state')).json()); } catch (e) { console.error(e); } }
const soon = () => { clearTimeout(timer); timer = setTimeout(refresh, 250); };
document.addEventListener('click', async (e) => {
  const b = e.target.closest('button[data-wo]'); if (!b) return;
  if (!confirm('Stop this agent now? Every further call under this work order will be refused, and the stop is anchored on chain.')) return;
  b.disabled = true; b.textContent = 'Stopping and anchoring…';
  const r = await (await fetch('/dashboard/suspend', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ workOrderHash: b.dataset.wo }) })).json();
  if (!r.ok) { alert(r.error); b.disabled = false; }
  refresh();
});
const es = new EventSource('/dashboard/events');
es.onopen = () => $('#live').classList.add('on');
es.onerror = () => $('#live').classList.remove('on');
es.onmessage = soon;
refresh(); setInterval(refresh, 15000);
</script></body></html>`;
