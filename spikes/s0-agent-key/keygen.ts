// S0 step 1: create the agent's EVM signing key (decision D2) outside the repository.
// Usage: pnpm keygen [name]
import { createAgentKey, agentKeyPath } from '@mandate-gate/core';

const name = process.argv[2] ?? 'agent-evm';
const k = createAgentKey(name);
console.log('Created agent key file:', agentKeyPath(name), '(mode 600, never commit or share it)');
console.log('EVM address   :', k.address);
console.log('Public key    :', k.publicKey);
