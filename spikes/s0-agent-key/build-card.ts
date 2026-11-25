// S0: build the final Agent Card for the minted agent and write it, byte for byte, to
// agent-card/mandate-gate-devops-agent.json. After this file is pinned on chain it must not change.
// Usage: pnpm build-card <tokenId>
import { writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { RegistryMcp, CCD_NETWORK } from '@mandate-gate/core';

export const CARD_PATH = '../../agent-card/mandate-gate-devops-agent.json';
export const CARD_URL = 'https://raw.githubusercontent.com/dholmes0207/concordium-trusted-agents-hackathon/main/agent-card/mandate-gate-devops-agent.json';
const OWNER = '3zKuq9cgzYgSs1cXE2ugGq3WkBNkPsAChj1fLSH8HhoQXoNL6s';
const REPO = 'https://github.com/dholmes0207/concordium-trusted-agents-hackathon';

const tokenId = process.argv[2];
if (!tokenId) { console.error('usage: pnpm build-card <tokenId>'); process.exit(1); }
const mcp = new RegistryMcp(); await mcp.init();
const r = await mcp.call('build_agent_card', {
  network: CCD_NETWORK, name: 'Mandate Gate Demo - DevOps Agent',
  description: "HolmesGPT-based DevOps agent operated by company A. Acts on customer infrastructure only through the customer's MandateGate gateway, with a signed work order and human approval for risky actions.",
  agent_uri: CARD_URL, owner_account: OWNER, token_id: tokenId, version: '1.0.0',
  skills: [
    { id: 'logs.read', name: 'Read service logs', description: 'Read recent log lines of a service in the customer environment.', tags: ['ops', 'read-only'] },
    { id: 'service.restart', name: 'Restart a service', description: 'Restart a service (reversible).', tags: ['ops'] },
    { id: 'deploy.prod', name: 'Deploy to production', description: 'Deploy a version to production; requires a named engineer to approve each action.', tags: ['ops', 'requires-approval'] },
  ],
  provider: { organization: 'Mandate Gate Demo (company A)', url: REPO },
  documentation_url: REPO,
});
const body: string = r.agent_card_json;
writeFileSync(CARD_PATH, body);
const sha = createHash('sha256').update(body).digest('hex');
console.log('written', CARD_PATH, Buffer.byteLength(body), 'bytes');
console.log('sha256 local :', sha);
console.log('sha256 tool  :', r.sha256 ?? r.metadata_hash_hex ?? '(not returned)');
console.log('tokenAddress :', JSON.parse(body).capabilities.extensions[0].params.tokenAddress);
