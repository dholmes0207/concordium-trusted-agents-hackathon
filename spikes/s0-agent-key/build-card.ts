// S0: build the final Agent Card for the minted agent and write it, byte for byte, to
// agent-card/mandate-gate-devops-agent.json. After this file is pinned on chain it must not change.
// Usage: pnpm build-card <tokenId> [--agent watcher]
import { writeFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { RegistryMcp, CCD_NETWORK } from '@mandate-gate/core';

import { profileFromArgs, REPO } from './profiles.js';
const profile = profileFromArgs();
const CARD_PATH = '../../agent-card/' + profile.file;
const CARD_URL = profile.url;
const OWNER = '3zKuq9cgzYgSs1cXE2ugGq3WkBNkPsAChj1fLSH8HhoQXoNL6s';

const tokenId = process.argv[2];
if (!tokenId || tokenId.startsWith('--')) { console.error('usage: pnpm build-card <tokenId> [--agent watcher]'); process.exit(1); }
if (existsSync(CARD_PATH)) { console.error(CARD_PATH, 'already exists and may be pinned on chain: refusing to overwrite'); process.exit(1); }
const mcp = new RegistryMcp(); await mcp.init();
const r = await mcp.call('build_agent_card', {
  network: CCD_NETWORK, name: profile.name,
  description: profile.description,
  agent_uri: CARD_URL, owner_account: OWNER, token_id: tokenId, version: '1.0.0',
  skills: profile.skills,
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
