# Demo video script (≤ 3 minutes)

> Requirement: *up to 3 minutes, showing your core flow working.* Everything below runs live on testnet,
> against a real Kubernetes cluster (`pnpm infra:up`, `pnpm demo:up`, Claude Code in `demo/claude-agent`), with
> customer B's dashboard (`http://127.0.0.1:7400/dashboard`) on screen next to the agent. Guide: `Tailieu/Huong-dan-demo-Claude-Code.md`.

| Time | Scene | What to show | What to say |
|---|---|---|---|
| 0:00–0:20 | Problem | Title slide, one diagram: provider's agent → customer's systems | "AI agents now operate customers' infrastructure. The customer cannot check which agent is calling, who authorised it, or whether a human approved a risky action." |
| 0:20–0:40 | Product | Architecture diagram from `docs/architecture.md` | "MandateGate is a gateway on the customer's side. The agent is unchanged; every call is checked on Concordium." |
| 0:40–1:05 | Agent investigates | Claude Code: "Service payments is slow and failing. Investigate and fix it." Real Kubernetes logs (pool exhausted); each call appears live on the dashboard with green checks | "Agent #1505, registered on Concordium, signs each call; the gateway checks its identity and its work order on chain." |
| 1:05–1:20 | Payment | Gateway terminal: `payment_required` → paid automatically | "Deploys cost 0.5 CCD from the agent's own wallet, within a 10 CCD budget set in the work order." |
| 1:20–1:50 | Approval | Approval page with the action; Browser Wallet popup; Approve | "The deploy is held until an engineer approves exactly this action with a Concordium ID proof. No personal data is shared." |
| 1:50–2:05 | Result | Agent reports `v2.2.1` deployed, pool healthy | "Approval verified on chain, payment settled, decision anchored, then executed." |
| 2:05–2:20 | Delegation | Lead agent hands "watch payments for 30 min, max 2 restarts" to sub-agent #1558 (`delegate_task`); dashboard shows the delegation under the work order; `pnpm sub-agent` restarts payments when the pool runs dry, the third restart is refused (`rate_limited`) | "Agents delegate too. The sub-agent gets only a narrower part of the mandate, signed by the lead, checked on every call." |
| 2:20–2:35 | Rejections | "Delete the customer-db data" → red card on the dashboard (`work_order_out_of_scope`); press **Stop this agent now** on the work order → lead and sub-agent both refused (`work_order_suspended_by_customer`), stop anchored | "Outside its mandate it is stopped, and the customer can pull the plug on the whole chain at any time: the stop itself is on chain." |
| 2:35–2:50 | Proof | CCDExplorer tabs: work order, VRA, VAA, payment, audit anchor; `verify-audit` → `RESULT: OK` | "Every step is on chain, and the audit log can be verified by anyone holding it." |
| 2:50–3:00 | Path to production | One slide: KMS keys, own node, ID App, pilot | "Next: HolmesGPT, ID App approvals, and a pilot on mainnet." |

## Recording checklist
- [ ] Issue a fresh work order (`wo issue --hours 8 --sponsor`) and start `pnpm demo:up` before recording
- [ ] Wallet on **testnet**; agent wallet has test CCD
- [ ] No private keys, seed phrases, `.export` files or API keys on screen
- [ ] CCDExplorer tabs pre-opened (fill in the hashes from the run, or from `docs/concordium-integration.md`)
- [ ] Speed up the waiting parts (approval page load, finality) rather than cutting them
- [ ] Video uploaded as **public / unlisted**; link opens while logged out
