# MandateGate

> **Concordium Trusted Agents Hackathon 2026** (Encode Club × Concordium): *Add trust and accountability to the AI agents you already have.*
>
> MandateGate lets a company's AI DevOps agent act on a customer's infrastructure without the customer trusting it blindly: every tool call goes through the customer's gateway, which checks on Concordium who the agent is, who authorised it to do what, and which named engineer approved each risky action, and anchors the record on chain.

![CI](https://github.com/dholmes0207/concordium-trusted-agents-hackathon/actions/workflows/ci.yml/badge.svg)

| | |
|---|---|
| 🎥 **Demo video (≤ 3 min)** | *to come* |
| 🔎 **CCDExplorer (testnet)** | *to come (agent registration, CIS-8 binding, anchors)* |
| 🚀 **Path to production** | [docs/path-to-production.md](docs/path-to-production.md) |

> **Status (25 Nov 2026):** build in progress. Working today: signed request envelopes, the MCP gateway with idempotency, size limits and a hash-chained audit log, the agent-side proxy, simulated customer infrastructure, and 15 automated tests. Next: on-chain agent checks (spike S0), work-order anchors and revocation (S1, L2), human approval with Verify & Access (L3).

---

## 1. What we built

### The problem
Managed-service providers increasingly let AI agents operate on their customers' infrastructure (read logs, restart services, deploy). The customer has no way to check **which agent** is calling, **who is accountable** for it, **what it was authorised to do**, or **whether a human approved** a risky action. Agents such as HolmesGPT already ask a human before mutating actions, but that approval lives inside the provider's agent, where the customer cannot verify it.

### The solution
MandateGate moves the checks to the customer's side and anchors them on Concordium:

| Layer | Check | Concordium |
|---|---|---|
| **L1 Agent identity** | The agent is registered, active, its Agent Card is unchanged, and each request is signed by its key | Agent Registry (CIS-8004), Verified by Concordium badge, CIS-8 key binding (EVM key, `eip155:84532`) |
| **L2 Mandate** | The agent's owner issued a signed, scoped, revocable work order | Register Data anchors; revocation watched on chain, fail-closed |
| **L3 Human approval** | A named engineer approved this exact high-risk action | Concordium ID / Verify & Access V1 (Browser Wallet, ID App) |
| **L4 Audit** | Every request, decision, approval and execution is logged and anchored | Hash-chained log, Register Data anchors, sponsored transactions |
| *(Extension)* Payments | The agent pays per privileged action within its work-order budget | x402 (`@x402/concordium`) |

## 2. How it works

```text
Any MCP agent (HolmesGPT, Claude Code)
   │ MCP (stdio)
   ▼
agent-proxy (company A) ── signed request ──▶ MandateGate (customer B, MCP over HTTP) ──▶ customer infrastructure
   holds the agent key                          L1 → L2 → L3 → execute → L4
                                                          │
                                                          ▼
                                                Concordium testnet
```

The agent itself is not modified: it sees ordinary MCP tools (`logs_read`, `service_restart`, `deploy_prod`, …). Details: [docs/architecture.md](docs/architecture.md).

## 3. Repository layout

```text
packages/
  core/          shared code: request envelope (EIP-191 signing), JCS hashing, CBOR anchors,
                 idempotency ledger, hash-chained audit log, tool catalogue, hosted MCP client
  gateway/       MandateGate: the customer's MCP server and decision pipeline (+ e2e tests)
  agent-proxy/   company A's local MCP server; signs every call with the agent key
  mock-ops/      simulated customer infrastructure (services, logs, deploys)
spikes/
  s0-agent-key/  agent EVM key + CIS-8 registration payload
  s1-anchor/     Register Data anchors, chain watcher (fail-closed)
  s3a/           Verify & Access V1 test with an account credential (done, see README there)
docs/            architecture, Concordium integration, path to production, demo script, checklist
Tailieu/         research notes, workshop reports, slides and transcripts (Vietnamese)
```

## 4. Run it locally

Prerequisites: Node.js ≥ 20 (22 recommended), pnpm 12. Keys never live in the repository: they go in `~/ccd-keys/` (override with `CCD_KEYS_DIR`).

```bash
pnpm install
pnpm test          # 15 offline tests: envelope, idempotency, audit chain, gateway end to end
pnpm typecheck
```

Run the pieces by hand:

```bash
pnpm mock-ops                                             # customer infrastructure on 127.0.0.1:7401
cp packages/gateway/gateway.config.example.json packages/gateway/gateway.config.json
GATEWAY_CONFIG=gateway.config.json pnpm gateway           # MandateGate on 127.0.0.1:7400/mcp
pnpm --filter spike-s0-agent-key keygen                   # creates ~/ccd-keys/agent-evm.json
```

Then register `packages/agent-proxy` as a stdio MCP server in your agent (for Claude Code: `claude mcp add mandate-gate -- pnpm --dir packages/agent-proxy start`).

## 5. Concordium components used

| Component | Used for | Status |
|---|---|---|
| Agent Registry (CIS-8004) + Agent Card | L1 agent identity, minted via agentcards.site | Next (S0) |
| Verified by Concordium badge | L1 five checks (registry, active, URL, bytes, owner) | Next (S0) |
| CIS-8 external key binding | L1: EVM key that signs every request | Payload built (S0) |
| Register Data | L2 work orders and revocations, L4 audit anchors | Script ready (S1) |
| Verify & Access V1 | L3 human approval bound to the action (`ResourceID` = action digest) | Tested on testnet (S3a) |
| Sponsored transactions | Fees paid by the gateway, not the agent or engineer | Planned |
| x402 | Pay-per-privileged-action extension | Planned |

## 6. Team

| Name | Role | GitHub |
|---|---|---|
| D. Holmes | Lead | dholmes0207 |
| *(teammate)* | | |

## 7. License

To be decided before the repository goes public (proposed: Apache-2.0). Concordium SDKs and APIs remain under their own licenses.
