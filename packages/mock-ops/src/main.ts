import { startMockOps } from './server.js';
const s = await startMockOps();
console.log('mock-ops (customer B infrastructure) listening on', s.address());
