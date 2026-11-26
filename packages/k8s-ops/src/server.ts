import { createServer, type Server } from 'node:http';
import { execFile } from 'node:child_process';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

/**
 * Customer B's ops API on a real Kubernetes cluster (kind, see infra/kind). Same contract as
 * mock-ops (POST /ops/<action> → {ok, result} | {ok:false, error}), so the gateway does not change.
 * Only the gateway calls it (127.0.0.1); it only touches the allow-listed deployments of one namespace.
 */
export interface K8sOpsConfig { context: string; namespace: string; services: string[]; imageRepo: string }
export const DEFAULT_K8S: K8sOpsConfig = {
  context: process.env.MGATE_K8S_CONTEXT ?? 'kind-mandate-gate',
  namespace: process.env.MGATE_K8S_NAMESPACE ?? 'customer-b',
  services: ['payments', 'billing', 'customer-db'],
  imageRepo: 'mgate/svc',
};

const KUBECTL = existsSync(join(homedir(), '.local/bin/kubectl')) ? join(homedir(), '.local/bin/kubectl') : 'kubectl';
const VERSION_RE = /^(v\d+\.\d+\.\d+|pg-\d+)$/;

export function createK8sOps(cfg: K8sOpsConfig = DEFAULT_K8S) {
  const kubectl = (args: string[], timeoutMs = 150_000) => new Promise<string>((resolve, reject) => {
    execFile(KUBECTL, ['--context', cfg.context, '-n', cfg.namespace, ...args], { timeout: timeoutMs, maxBuffer: 4 << 20 },
      (err, stdout, stderr) => (err ? reject(new Error((stderr || err.message).trim().split('\n').slice(-1)[0])) : resolve(stdout)));
  });
  const svc = (name: unknown): string => {
    if (typeof name !== 'string' || !cfg.services.includes(name)) throw new Error(`unknown service ${String(name)}`);
    return name;
  };
  const rollout = (s: string) => kubectl(['rollout', 'status', `deploy/${s}`, '--timeout=120s']);

  async function status(s: string) {
    const d = JSON.parse(await kubectl(['get', 'deploy', s, '-o', 'json']));
    const pods = JSON.parse(await kubectl(['get', 'pods', '-l', `app=${s}`, '-o', 'json']));
    const image: string = d.spec.template.spec.containers[0].image;
    let releases: unknown = [];
    try { releases = JSON.parse(JSON.parse(await kubectl(['get', 'configmap', 'releases', '-o', 'json'])).data?.[s] ?? '[]'); } catch { /* none */ }
    return {
      service: s, version: image.split(':')[1], image,
      replicas: d.spec.replicas, ready: d.status.readyReplicas ?? 0,
      // Pods being replaced by a rollout are left out: they are not serving any more.
      pods: pods.items.filter((p: any) => !p.metadata.deletionTimestamp && (p.status.phase === 'Running' || p.status.phase === 'Pending')).map((p: any) => ({ name: p.metadata.name, phase: p.status.phase,
        restarts: p.status.containerStatuses?.[0]?.restartCount ?? 0, startedAt: p.status.startTime })),
      releases,
    };
  }

  const actions: Record<string, (p: any) => Promise<unknown>> = {
    'logs.read': async ({ service, lines = 20 }) => {
      const s = svc(service); const n = Math.max(1, Math.min(Number(lines) || 20, 100));
      const out = await kubectl(['logs', `deploy/${s}`, '--tail', String(n)]);
      return { service: s, lines: out.trim().split('\n').filter(Boolean) };
    },
    'service.status': async ({ service }) => status(svc(service)),
    'service.restart': async ({ service }) => {
      const s = svc(service); await kubectl(['rollout', 'restart', `deploy/${s}`]); await rollout(s);
      return { service: s, restarted: true, status: await status(s) };
    },
    'service.scale': async ({ service, replicas }) => {
      const s = svc(service);
      if (!Number.isInteger(replicas) || replicas < 0 || replicas > 10) throw new Error('replicas must be 0..10');
      await kubectl(['scale', `deploy/${s}`, `--replicas=${replicas}`]); if (replicas > 0) await rollout(s);
      return { service: s, replicas };
    },
    'deploy.prod': async ({ service, version }) => {
      const s = svc(service);
      if (typeof version !== 'string' || !VERSION_RE.test(version)) throw new Error('bad version');
      const from = (await status(s)).version;
      await kubectl(['set', 'image', `deploy/${s}`, `app=${cfg.imageRepo}:${version}`]);
      try { await rollout(s); } catch (e) {
        await kubectl(['rollout', 'undo', `deploy/${s}`]).catch(() => undefined);
        throw new Error(`rollout of ${version} failed and was undone: ${(e as Error).message}`);
      }
      return { service: s, from, to: version };
    },
    'data.delete': async ({ service }) => {
      // Destructive on purpose: in the demo the gateway always refuses it (out of scope).
      const s = svc(service); await kubectl(['scale', `deploy/${s}`, '--replicas=0']);
      return { service: s, deleted: true };
    },
  };

  return {
    async run(action: string, params: unknown) {
      const fn = actions[action]; if (!fn) throw new Error(`unknown action ${action}`);
      return fn(params ?? {});
    },
  };
}

export function startK8sOps(port = Number(process.env.MOCK_OPS_PORT ?? 7401), cfg: K8sOpsConfig = DEFAULT_K8S): Promise<Server> {
  const ops = createK8sOps(cfg);
  const server = createServer((req, res) => {
    const m = /^\/ops\/([a-z.]+)$/.exec(req.url ?? '');
    if (req.method !== 'POST' || !m) { res.writeHead(404).end(); return; }
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 16_384) req.destroy(); });
    req.on('end', async () => {
      try {
        const result = await ops.run(m[1], body ? JSON.parse(body) : {});
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: true, result }));
      } catch (e) {
        res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: false, error: (e as Error).message }));
      }
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}
