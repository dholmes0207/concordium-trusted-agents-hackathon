# [Project name]

> **Concordium Trusted Agents Hackathon 2026** (Encode Club × Concordium): *Add trust and accountability to the AI agents you already have.*
>
> One-line pitch: [Which agent, which trust problem, and which Concordium capability solves it.]

| | |
|---|---|
| 🎥 **Demo video (≤ 3 min)** | [link] |
| 🔎 **CCDExplorer (testnet)** | [agent / contract / transaction link] |
| 🌐 **Live demo** *(optional)* | [link] |
| 📊 **Slides** *(optional)* | [link] |
| 🚀 **Path to production** | [docs/path-to-production.md](docs/path-to-production.md) |

---

## 1. What we built

[2–3 paragraphs: the existing project or agent, what it does, and what it can do now that it couldn't do before Concordium.]

### The problem
[Who suffers when this agent cannot be trusted? Give a concrete trust failure: identity, authority, payment, or auditability.]

### The solution
[How the agent proves who is behind it, what it is allowed to do, how it pays, and how actions can be audited later.]

## 2. How it works

[Architecture diagram or short flow. Details in [docs/architecture.md](docs/architecture.md).]

```
User ──▶ Agent ──▶ [Concordium component] ──▶ Counterparty / Service
```

## 3. Concordium components used

Details and every on-chain link: [docs/concordium-integration.md](docs/concordium-integration.md).

| Component | Used for | Where in code |
|---|---|---|
| Agent Registry (CIS-8004) + Agent Card | | |
| Verified by Concordium badge | | |
| Concordium ID / ZK proofs (Verify & Access) | | |
| CIS-8 cross-chain key binding | | |
| x402 payments | | |
| Protocol-Level Tokens / sponsored transactions | | |
| Agent Registry MCP / A2A | | |
| Smart contract (Rust/Wasm) | | |

*Delete the rows you don't use.*

## 4. Demo flow

[What the 3-minute video shows, step by step. Script in [docs/demo-script.md](docs/demo-script.md).]

## 5. Run it locally

### Prerequisites
- Node.js ≥ 18 / Rust (cargo-concordium) — [adjust to the stack]
- Concordium Browser Wallet or ID App on **testnet**: use the *Concordium Test IDP* and request free test CCD
- (Optional) [Concordium local stack](https://github.com/Concordium/concordium-local-stack) for a devnet

### Setup
```bash
cp .env.example .env   # fill in testnet endpoints; never commit keys
# install & run commands
```

## 6. Repository layout

```
app/                  # agent / backend / frontend code
contracts/            # Concordium smart contracts (Rust → Wasm), if any
docs/                 # architecture, Concordium integration, path to production, demo script
Tailieu/              # research notes, workshop slides & transcripts (Vietnamese)
```

## 7. Team

| Name | Role | GitHub |
|---|---|---|
| | | |

## 8. License

[MIT / Apache-2.0]. Concordium SDKs and APIs remain under their own licenses.
