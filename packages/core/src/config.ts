import { homedir } from 'node:os';
import { join } from 'node:path';

/** Concordium testnet as used everywhere in the demo. */
export const CCD_NETWORK = 'testnet' as const;
export const CCD_TESTNET_CAIP2 = 'ccd:4221332d34e1694168c2a0c0b3fd0f27';
export const CCD_GRPC = { host: 'grpc.testnet.concordium.com', port: 20000 };

/** Agent Registry contracts on testnet (W2 / check-badge "expected.contracts"). */
export const CIS8004_CONTRACT = { index: 12802n, subindex: 0n };
export const CIS8_CONTRACT = { index: 12801n, subindex: 0n };

/** Hosted Agent Registry MCP (convenience only; the gateway re-checks the chain). */
export const REGISTRY_MCP_URL = 'https://agent-registry-mcp.concordium.com/mcp';

/** Decision D2: the agent's signing key is an EVM key bound via CIS-8 under Base Sepolia. */
export const AGENT_KEY_NAMESPACE = 'eip155:84532';
export const AGENT_KEY_TYPE = 'secp256k1-uncompressed';
export const AGENT_PROOF_SCHEME = 'ethereum-personal-sign';

/** Keys live outside the repository. Override with CCD_KEYS_DIR. */
export const KEYS_DIR = process.env.CCD_KEYS_DIR ?? join(homedir(), 'ccd-keys');
