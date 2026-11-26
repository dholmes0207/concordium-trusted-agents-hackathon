# MandateGate

> **Concordium Trusted Agents Hackathon 2026** (Encode Club × Concordium): *Add trust and accountability to the AI agents you already have.*
>
> MandateGate lets a company's AI DevOps agent act on a customer's infrastructure without the customer trusting it blindly: every tool call goes through the customer's gateway, which checks on Concordium who the agent is, who authorised it to do what, and which named engineer approved each risky action, and anchors the record on chain.

![CI](https://github.com/dholmes0207/concordium-trusted-agents-hackathon/actions/workflows/ci.yml/badge.svg)

| | |
|---|---|
| 🎥 **Demo video (≤ 3 min)** | *to come* |
| 🔎 **CCDExplorer (testnet)** | Agent **#1505** ([register](https://ccdexplorer.io/testnet/transaction/105b018650e557f75b1ebd940be2c2f5a2594b84ff2f80c8bd0558b24991bb65) · [pin card](https://ccdexplorer.io/testnet/transaction/50eb19421df3173f9b2664f754d8d7a522b1d2aeaae594f53a91b2f583b72eba) · [CIS-8 key binding](https://ccdexplorer.io/testnet/transaction/d219aef839d039136d67160d0053b83c90b7b86fb46c850f3f20fdbea39dd72a)) · badge `JyP9Y8gnY2peWyyQMsrAk` |
| 🌐 **Agent page (live verification)** | https://dholmes0207.github.io/concordium-trusted-agents-hackathon/ |
| 🪪 **Agent Card** | [agent-card/mandate-gate-devops-agent.json](agent-card/mandate-gate-devops-agent.json) (SHA-256 pinned on chain) |
| 🚀 **Path to production** | [docs/path-to-production.md](docs/path-to-production.md) |

> **Status (26 Nov 2026):** all four layers are implemented. L1 on-chain agent checks and L2 anchored, revocable work orders run live on testnet. L3 (approval held until an engineer answers a Verify & Access V1 request whose `ResourceID` is the action digest) and L4 (audit head anchored as `MGATE-AUD` before every level-2 action, fail closed) pass 49 automated tests and ran live on testnet with the Browser Wallet ([VRA](https://ccdexplorer.io/testnet/transaction/0ac27871fda1d2b975d3a98dfbe2e83937cfe32ae18c7b41599dbd3cd7633227) → [VAA](https://ccdexplorer.io/testnet/transaction/ad4768043e829c66ef2c2c269fab3cb011eb3fa7dc5c789f573e193c452b241d) → [audit anchor](https://ccdexplorer.io/testnet/transaction/29908ace3784c9af96670eb11cf7a4ed8c24dc9f6b7a5ed355c2c0bd636bf37d) → deploy). x402 is in too: each level-2 action costs 0.5 test CCD from the agent's own wallet, settled only after approval, capped by the work order's budget ([live payment](https://ccdexplorer.io/testnet/transaction/ec5f414e40bf801bd8f833464ba1c247a108a2547292c95e87eafe2474e32cb4)). Claude Code runs as the agent today (`demo/claude-agent`) against a real local Kubernetes cluster (`infra/kind`), with a live customer dashboard and kill switch; next: HolmesGPT, ID App approval.

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

The agent itself is not modified: it sees ordinary MCP tools (`logs_read`, `service_restart`, `deploy_prod`, …). Details: [docs/architecture.md](docs/architecture.md) (pipeline, trust model, threats and tests) · on-chain evidence: [docs/concordium-integration.md](docs/concordium-integration.md).

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

Prerequisites: Node.js 22 (`.nvmrc`), pnpm 12. Keys never live in the repository: they go in `~/ccd-keys/` (override with `CCD_KEYS_DIR`).

```bash
pnpm install
pnpm test          # 49 offline tests: envelope, audit chain, work orders, gateway end to end (L1–L4, fake chain)
pnpm typecheck
```

Run the pieces by hand:

```bash
pnpm mock-ops                                             # customer infrastructure on 127.0.0.1:7401
cp packages/gateway/gateway.config.example.json packages/gateway/gateway.config.json
GATEWAY_CONFIG=gateway.config.json pnpm gateway           # MandateGate on 127.0.0.1:7400/mcp
pnpm --filter spike-s0-agent-key keygen                   # creates ~/ccd-keys/agent-evm.json
```

Company A issues a work order (anchored on testnet; `--approver <credId>` names the engineer who may approve):

```bash
pnpm --filter @mandate-gate/issuer wo issue --hours 3 --sponsor
```

Live run against testnet with the approval flow (sends VRA, VAA and `MGATE-AUD` transactions from the gateway account): the deploy is held and the script prints an approval link to open in a browser with the Concordium Browser Wallet (testnet).

```bash
LIVE_APPROVAL=1 pnpm --filter @mandate-gate/gateway exec tsx scripts/testnet-e2e.ts <work-order.json> <start height>
pnpm --filter @mandate-gate/gateway verify-audit <audit dir>      # log vs. on-chain anchors, read only
```

Then register `packages/agent-proxy` as a stdio MCP server in your agent (for Claude Code: `claude mcp add mandate-gate -- pnpm --dir packages/agent-proxy start`).

## 5. Concordium components used

| Component | Used for | Status |
|---|---|---|
| Agent Registry (CIS-8004) + Agent Card | L1 agent identity: agent #1505, card hosted in this repo | ✅ Live on testnet |
| Verified by Concordium badge | L1 five checks (registry, active, URL, bytes, owner) | ✅ `badge_valid: true`; gateway check `ok: true` |
| CIS-8 external key binding | L1: EVM key (`eip155:84532`) that signs every request | ✅ Bound to the agent owner |
| Register Data | L2 work orders and revocations ([issue, sponsored](https://ccdexplorer.io/testnet/transaction/ffd8f75ffddebc1719a0d551dc53e1053532b8572c8e74c1687b35b46bd19030) · [revoke](https://ccdexplorer.io/testnet/transaction/aa1cac7f1a2eb1802faedfef223ad35be2c990dba284a978ab33516cbe2c4ab9)), L4 audit anchors (`MGATE-AUD`, before each level-2 action) | ✅ L2 and L4 live on testnet |
| Verify & Access V1 | L3 human approval bound to the action (`ResourceID` = action digest; VRA anchored by the gateway, proof checked with `VerificationAuditRecordV1.createChecked`, VAA anchored) | ✅ Live on testnet with Browser Wallet |
| Sponsored transactions | Fees paid by the gateway, not the agent or engineer | ✅ Work-order anchor sponsored by the gateway account |
| x402 (`@x402/concordium`) | 0.5 CCD per level-2 action from the agent wallet, gateway as facilitator and fee sponsor, budget per work order | ✅ Live payment on testnet |

## 6. Team

| Name | Role | GitHub |
|---|---|---|
| D. Holmes | Lead | dholmes0207 |
| *(teammate)* | | |

## 7. License

[Apache-2.0](LICENSE). Concordium SDKs and APIs remain under their own licenses.
