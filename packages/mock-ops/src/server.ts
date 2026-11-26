import { createServer, type Server } from 'node:http';

/**
 * Simulated infrastructure of customer B: a few services and an ops API.
 * Only the gateway should be able to reach it (it binds to 127.0.0.1).
 */
interface Service { version: string; replicas: number; status: 'running' | 'restarting' | 'deleted'; logs: string[] }

export function createMockOps() {
  const services: Record<string, Service> = {
    payments: { version: 'v2.2.0', replicas: 2, status: 'running', logs: [] },
    billing: { version: 'v1.8.3', replicas: 1, status: 'running', logs: [] },
    'customer-db': { version: 'pg-16', replicas: 1, status: 'running', logs: [] },
  };
  const log = (s: Service, msg: string) => { s.logs.push(`${new Date().toISOString()} ${msg}`); if (s.logs.length > 50) s.logs.shift(); };
  log(services.payments, 'WARN p99 latency 1840ms on /charge (threshold 800ms)');
  log(services.payments, 'ERROR connection pool exhausted (max=20) after deploy v2.2.0');
  log(services.payments, 'INFO release v2.2.1 is available: fixes a connection leak in /charge introduced in v2.2.0');
  log(services.billing, 'INFO nightly invoice run completed');

  const actions: Record<string, (p: any) => unknown> = {
    'logs.read': ({ service, lines = 20 }) => { const s = get(service); return { service, lines: s.logs.slice(-Math.min(lines, 50)) }; },
    'service.status': ({ service }) => { const s = get(service); return { service, version: s.version, replicas: s.replicas, status: s.status }; },
    'service.restart': ({ service }) => {
      const s = get(service); s.status = 'running'; log(s, 'INFO restarted by operator');
      // The leak is in the code: a restart only buys time.
      if (service === 'payments' && s.version === 'v2.2.0') log(s, 'ERROR connection pool exhausted again 40s after restart (leak in /charge)');
      return { service, status: s.status };
    },
    'service.scale': ({ service, replicas }) => {
      const s = get(service); if (!Number.isInteger(replicas) || replicas < 0 || replicas > 10) throw new Error('replicas must be 0..10');
      s.replicas = replicas; log(s, `INFO scaled to ${replicas}`); return { service, replicas };
    },
    'deploy.prod': ({ service, version }) => {
      const s = get(service); if (typeof version !== 'string' || !/^v?\d+\.\d+\.\d+$/.test(version)) throw new Error('bad version');
      const from = s.version; s.version = version; log(s, `INFO deployed ${version} (was ${from})`);
      if (service === 'payments' && version !== 'v2.2.0') log(s, 'INFO connection pool healthy (6/20 in use), p99 latency 210ms on /charge');
      return { service, from, to: version };
    },
    'data.delete': ({ service }) => { const s = get(service); s.status = 'deleted'; log(s, 'WARN data deleted'); return { service, status: s.status }; },
  };
  function get(name: string): Service { const s = services[name]; if (!s) throw new Error(`unknown service ${name}`); return s; }

  return {
    services,
    run(action: string, params: unknown) {
      const fn = actions[action]; if (!fn) throw new Error(`unknown action ${action}`);
      return fn(params ?? {});
    },
  };
}

export function startMockOps(port = Number(process.env.MOCK_OPS_PORT ?? 7401)): Promise<Server> {
  const ops = createMockOps();
  const server = createServer((req, res) => {
    const m = /^\/ops\/([a-z.]+)$/.exec(req.url ?? '');
    if (req.method !== 'POST' || !m) { res.writeHead(404).end(); return; }
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 16_384) req.destroy(); });
    req.on('end', () => {
      try {
        const result = ops.run(m[1], body ? JSON.parse(body) : {});
        res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: true, result }));
      } catch (e) {
        res.writeHead(400, { 'content-type': 'application/json' }).end(JSON.stringify({ ok: false, error: (e as Error).message }));
      }
    });
  });
  return new Promise((resolve) => server.listen(port, '127.0.0.1', () => resolve(server)));
}
