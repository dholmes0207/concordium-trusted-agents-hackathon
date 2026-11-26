// Customer B's "payments" service, small enough to read in one go. Real process, real logs, real rollouts.
// v2.2.0 has a bug: about 15% of /charge requests never return their DB connection to the pool, so the
// pool (max 20) runs dry after a minute or so and latency climbs. v2.2.1 fixes it. Traffic is generated
// in-process so the symptoms appear without a load tester.
const http = require('node:http');
const VERSION = process.env.VERSION || 'dev';
const SERVICE = process.env.SERVICE || 'payments';
const POOL_MAX = 20;
const LEAK = VERSION === 'v2.2.0' ? 0.15 : 0;
let inUse = 0, served = 0, failed = 0, lastExhaustedLog = 0;
const lat = [];
const log = (level, msg) => console.log(`${new Date().toISOString()} ${level} ${msg}`);

function charge() {
  if (SERVICE !== 'payments') { served++; return; }
  if (inUse >= POOL_MAX) {
    failed++;
    if (Date.now() - lastExhaustedLog > 2000) { log('ERROR', `connection pool exhausted (max=${POOL_MAX}) on /charge, request failed`); lastExhaustedLog = Date.now(); }
    lat.push(5000); return;
  }
  inUse++;
  const ms = Math.round(120 + Math.pow(inUse / POOL_MAX, 3) * 1800 + Math.random() * 40);
  lat.push(ms);
  setTimeout(() => { served++; if (Math.random() >= LEAK) inUse--; }, ms);
}

setInterval(charge, 330);
setInterval(() => {
  const s = lat.splice(0).sort((a, b) => a - b);
  const p99 = s.length ? s[Math.min(s.length - 1, Math.floor(s.length * 0.99))] : 0;
  const level = p99 > 800 || failed ? 'WARN' : 'INFO';
  log(level, `pool in_use=${inUse}/${POOL_MAX} p99=${p99}ms on /charge served=${served} failed=${failed}`);
  served = 0; failed = 0;
}, 10_000);

http.createServer((req, res) => {
  if (req.url === '/healthz') { res.writeHead(200).end('ok'); return; }
  res.writeHead(200, { 'content-type': 'application/json' }).end(JSON.stringify({ service: SERVICE, version: VERSION, pool: { inUse, max: POOL_MAX } }));
}).listen(8080, () => log('INFO', `${SERVICE} ${VERSION} started`));
process.on('SIGTERM', () => { log('INFO', 'shutting down'); process.exit(0); });
