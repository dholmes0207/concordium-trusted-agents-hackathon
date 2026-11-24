import { mkdirSync, readFileSync, writeFileSync, existsSync, chmodSync } from 'node:fs';
import { join } from 'node:path';
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts';
import { KEYS_DIR } from './config.js';

export interface AgentKeyFile {
  kind: 'mandate-gate-agent-evm-key';
  address: `0x${string}`;
  publicKey: `0x${string}`; // uncompressed, 0x04...
  privateKey: `0x${string}`;
  createdAt: string;
}

export const agentKeyPath = (name = 'agent-evm') => join(KEYS_DIR, `${name}.json`);

/** Creates a new EVM key for the agent. Refuses to overwrite an existing one. */
export function createAgentKey(name = 'agent-evm'): AgentKeyFile {
  const path = agentKeyPath(name);
  if (existsSync(path)) throw new Error(`${path} already exists; refusing to overwrite`);
  mkdirSync(KEYS_DIR, { recursive: true, mode: 0o700 });
  const privateKey = generatePrivateKey();
  const acct = privateKeyToAccount(privateKey);
  const file: AgentKeyFile = {
    kind: 'mandate-gate-agent-evm-key',
    address: acct.address,
    publicKey: acct.publicKey,
    privateKey,
    createdAt: new Date().toISOString(),
  };
  writeFileSync(path, JSON.stringify(file, null, 2), { mode: 0o600 });
  chmodSync(path, 0o600);
  return file;
}

export function loadAgentKey(name = 'agent-evm'): AgentKeyFile {
  const f = JSON.parse(readFileSync(agentKeyPath(name), 'utf8')) as AgentKeyFile;
  if (f.kind !== 'mandate-gate-agent-evm-key') throw new Error('not an agent key file');
  return f;
}
