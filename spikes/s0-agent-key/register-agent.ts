// S0 tx 1: mint the agent NFT (CIS-8004 register) to company A. The card URI and hash are
// pinned afterwards with setAgentURI, once the card (which embeds the token id) is hosted.
// Usage: pnpm register-agent              # dry run: show the payload
//        pnpm register-agent --submit     # sign with ~/ccd-keys/company-A.export and send
import { RegistryMcp, CCD_NETWORK } from '@mandate-gate/core';
import { describe, submitUpdate, loadAccount, type McpUpdatePayload } from './chain.js';
import { AccountAddress } from '@concordium/web-sdk';

const submit = process.argv.includes('--submit');
const owner = AccountAddress.toBase58(loadAccount('company-A.export').address);
const mcp = new RegistryMcp(); await mcp.init();
const before = await mcp.call('agents_by_owner', { owner_account: owner, network: CCD_NETWORK }).catch(() => null);
console.log('agents already owned by company-A:', JSON.stringify(before)?.slice(0, 300));
const p: McpUpdatePayload = await mcp.call('build_register', { network: CCD_NETWORK, sender: owner });
console.log('tx 1 (register):', describe(p));
if (!submit) { console.log('dry run; pass --submit to send'); process.exit(0); }
const r = await submitUpdate(p, 'company-A.export');
console.log(JSON.stringify(r, null, 2));
const after = await mcp.call('agents_by_owner', { owner_account: owner, network: CCD_NETWORK });
console.log('agents owned by company-A now:', JSON.stringify(after).slice(0, 600));
