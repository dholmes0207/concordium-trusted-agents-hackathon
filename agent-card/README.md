# Agent Card

`mandate-gate-devops-agent.json` is the A2A Agent Card of the demo agent (CIS-8004 token **1505** on
Concordium testnet, owner = company A `3zKuq9cgzYgSs1cXE2ugGq3WkBNkPsAChj1fLSH8HhoQXoNL6s`).

Its SHA-256 is pinned on chain with `setAgentURI`, and verifiers fetch it from
`https://raw.githubusercontent.com/dholmes0207/concordium-trusted-agents-hackathon/main/agent-card/mandate-gate-devops-agent.json`.

**Do not edit, reformat or re-save this file.** Changing a single byte breaks the badge
(`card_hash_mismatch`). To change the card: regenerate it with `pnpm --filter spike-s0-agent-key build-card 1505`,
commit, then pin the new hash with a new `setAgentURI` transaction.
