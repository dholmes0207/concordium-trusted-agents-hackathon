// Sub-agent "MandateGate Payments Watcher" (#1558). No LLM: a small loop that acts only under the
// delegation the lead agent (#1505) signed for it, through the customer's gateway like any agent.
// Every 30 s: status + recent logs of the delegated service; restart it if the connection pool is
// exhausted again (the gateway enforces the delegated restart limit). Stops when the delegation
// expires or the gateway refuses it (revoked, stopped by the customer, out of scope).
//   pnpm sub-agent        (waits for .data/delegations/current-payments-watcher.json)
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadAgentKey, toolByName, delegationHash } from '@mandate-gate/core';
import { connectGateway, signedCall, type DelegationFile, type ProxyConfig } from './proxy.js';

const repo = join(import.meta.dirname, '../../..');
const FILE = process.env.MGATE_DELEGATION_FILE ?? join(repo, '.data/delegations/current-payments-watcher.json');
const EVERY = Number(process.env.MGATE_WATCH_INTERVAL_S ?? 30) * 1000;
const STOP = /revoked|suspended|expired|delegation_|out_of_scope|not_anchored|agent_/;
const key = loadAgentKey(process.env.MGATE_AGENT_KEY ?? 'agent-watcher-evm');
const t = () => new Date().toLocaleTimeString();
const say = (s: string) => console.log(`${t()}  ${s}`);

async function waitForDelegation(): Promise<{ chain: DelegationFile; mtime: number }> {
  let shown = false;
  for (;;) {
    if (existsSync(FILE)) return { chain: JSON.parse(readFileSync(FILE, 'utf8')), mtime: statSync(FILE).mtimeMs };
    if (!shown) { say(`waiting for a delegation from the lead agent (${FILE})`); shown = true; }
    await new Promise((r) => setTimeout(r, 3000));
  }
}

let { chain, mtime } = await waitForDelegation();
for (;;) {
  const leaf = chain.delegations[chain.delegations.length - 1].delegation;
  if (leaf.agent.keyAddress.toLowerCase() !== key.address.toLowerCase()) { say('delegation is for another agent; waiting'); await new Promise((r) => setTimeout(r, 5000)); ({ chain, mtime } = await waitForDelegation()); continue; }
  const service = leaf.scope.actions[0].resources[0].replace(/^svc:/, '');
  const canRestart = leaf.scope.actions.some((a) => a.action === 'service.restart');
  say(`delegation ${leaf.id} (${delegationHash(leaf).slice(0, 12)}…) from agent #${leaf.delegator.tokenId}: "${leaf.purpose ?? ''}"`);
  say(`watching svc:${service} until ${new Date(leaf.expiresAt * 1000).toLocaleTimeString()}; allowed: ${leaf.scope.actions.map((a) => a.action + (a.maxPerHour ? ` (max ${a.maxPerHour}/h)` : '')).join(', ')}`);
  const cfg: ProxyConfig = {
    gatewayUrl: process.env.MGATE_GATEWAY_URL ?? 'http://127.0.0.1:7400/mcp', audience: leaf.audience,
    agentTokenId: leaf.agent.tokenId, agentAddress: key.address, privateKey: key.privateKey,
    workOrder: chain.workOrder, delegations: chain.delegations, runtime: { model: 'payments-watcher', version: '1.0.0' },
  };
  const call = async (name: string, params: Record<string, unknown>) => {
    const c = await connectGateway(cfg.gatewayUrl);
    try {
      const r = await c.callTool({ name, arguments: { params, auth: await signedCall(cfg, toolByName(name)!, params) } }, undefined, { timeout: 180_000 });
      return JSON.parse((r.content as Array<{ text: string }>)[0].text) as { status: string; reason?: string; result?: any };
    } finally { await c.close(); }
  };
  let stop = false;
  while (!stop) {
    if (Date.now() / 1000 >= leaf.expiresAt) { say('delegation expired: stopping'); process.exit(0); }
    try {
      const logs = await call('logs_read', { service, lines: 8 });
      if (logs.status !== 'ok') { say(`logs_read denied: ${logs.reason}`); if (STOP.test(logs.reason ?? '')) { say('the gateway refused my delegation: stopping'); process.exit(0); } }
      else {
        const lines: string[] = logs.result.lines ?? [];
        const pool = [...lines].reverse().find((l) => l.includes('pool in_use='));
        const exhausted = lines.slice(-4).some((l) => l.includes('pool exhausted')) || /failed=[1-9]/.test(pool ?? '');
        say(`svc:${service} ${pool ? pool.replace(/^\S+\s+\S+\s+/, '') : '(no pool metrics yet)'}${exhausted ? '  <- pool exhausted' : ''}`);
        if (exhausted && canRestart) {
          const r = await call('service_restart', { service });
          say(r.status === 'ok' ? `restarted svc:${service}` : `service_restart denied: ${r.reason}`);
          if (r.status !== 'ok' && STOP.test(r.reason ?? '')) { say('the gateway refused my delegation: stopping'); process.exit(0); }
        }
      }
    } catch (e) { say(`gateway unreachable: ${(e as Error).message}`); }
    await new Promise((r) => setTimeout(r, EVERY));
    if (existsSync(FILE) && statSync(FILE).mtimeMs !== mtime) { ({ chain, mtime } = await waitForDelegation()); say('new delegation received'); stop = true; }
  }
}
