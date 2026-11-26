# Path to production

> What it would take to run MandateGate on mainnet in front of real users. Winners can apply to
> Concordium's Grants Program, so this page also serves as the outline of a grant plan.

## 1. Target users and market

- **Who uses it:** managed-service providers and platform teams that let AI agents (HolmesGPT, Claude Code,
  in-house agents) operate customer infrastructure, and the customers who have to allow it.
- **Who pays:** the customer runs the gateway and pays the on-chain fees (it is the party protected); the
  provider gets a way to win customers that do not accept "trust our agent".
- **Why now:** agents already ask a human before mutating actions, but that approval and the agent's
  identity live inside the provider's tooling, where the customer cannot check them. Record-keeping
  expectations such as EU AI Act Article 12 push towards logs a third party can verify.
- **How we differ:** policy engines and approval bots inside the agent stack are trusted by the side that
  runs them. MandateGate moves the checks to the customer's side and makes identity, mandate, approval,
  payment and records verifiable on a public chain, without changing the agent.

## 2. Current state (hackathon, testnet)

**Works end to end on testnet** (see [concordium-integration.md](concordium-integration.md)):
agent #1505 with badge and CIS-8 key; signed requests; anchored, revocable work orders with a fail-closed
chain follower; approval with Verify & Access V1 from the Browser Wallet; x402 payments from the agent's
wallet within a work-order budget, settled after approval; hash-chained audit anchored before each level-2
action, every 5 minutes and at shutdown; Claude Code as the agent; 48 automated tests.

**Mocked or simplified:**

| Area | Hackathon | Production |
|---|---|---|
| Customer infrastructure | A real local Kubernetes cluster (kind) driven through `k8s-ops` (kubectl: logs, rollout restart, scale, set image with rollback); `mock-ops` remains for tests | Kubernetes API with a least-privilege service account, plus CI/CD and cloud adapters |
| Company identity | A personal testnet identity plays company A (the business-identity provider required a real ID check, which we did not do) | Company account with a business identity (legal name / LEI) and a check of it at onboarding |
| Approval display | The wallet does not show the request context; the gateway's page shows the action | ID App or wallet support for displaying `ContextString`; approval page served by the provider and cross-checked |
| Approver binding | Salted commitment to the approver, tested offline; live runs accepted any verified account | Approver lists per customer, rotation, and break-glass rules |
| Keys | Files in `~/ccd-keys` (mode 600) | HSM / KMS for the gateway and agent keys; separate hot wallet with a small balance for x402 |
| Dashboard | Customer B's live dashboard with kill switch, served on 127.0.0.1 without login | Single sign-on and roles for the customer's operators |
| Storage and scale | One gateway process, JSON-lines files | Database, several gateway replicas sharing one transaction queue per account |
| Chain access | Public testnet gRPC and the hosted Agent Registry MCP | Own node(s) plus the hosted services as fallback; monitoring of chain lag |
| Agent | Claude Code (HolmesGPT integration in progress) | HolmesGPT and other MCP agents; A2A where needed |

## 3. Mainnet readiness gaps

| Area | Gap | Plan |
|---|---|---|
| Identity | Testnet identity provider; personal identity as company A | Real identity providers on mainnet; business identity for providers; customer onboarding of owners |
| Keys and custody | Plain key files | KMS/HSM signing for gateway sponsorship and anchors; agent key in the provider's KMS; x402 wallet with balance limits |
| Payments | Test CCD; sponsorship fee observed around 5 test CCD per payment, more than the 0.5 CCD price | Measure real mainnet fees (pegged to EUR cents); price per action from that; consider a stablecoin PLT (EURR/USDR) for prices in euros |
| Revocation latency | About 15 s after finality | Own node close to the gateway, streaming finalized blocks; optional pre-flight revocation check for level-2 actions |
| Availability | Gateway fails closed when the chain view is stale | Two nodes, alerts on lag, documented emergency mode decided by the customer (still fail closed by default) |
| Compliance and privacy (GDPR, EU AI Act) | Audit records stay off chain; only hashes are anchored | Retention policy for audit files, data-processing agreement between A and B, mapping to Article 12 record-keeping |
| Security review | No external review | Review of envelope, digest and anchor formats; penetration test of the gateway; fuzzing of the MCP surface |
| Dependencies on Concordium roadmap | Agent Registry, Verify & Access V1 and x402 package are new | Track releases; adopt Protocol-Level Locks (announced for January 2027) for budgets held on chain |

## 4. Milestones (after the hackathon)

| Milestone | Scope | Timeline |
|---|---|---|
| M1: production-grade gateway | HolmesGPT integration, ID App approval, KMS keys, database, own node, external review of formats | Q1 2027 |
| M2: pilot | One provider and one customer on mainnet with real Kubernetes adapters and business identities | Q2 2027 |
| M3: mainnet launch | Self-hosted gateway package, onboarding tool for providers, dashboard over the audit anchors | H2 2027 |

## 5. Business model and costs

- **Revenue:** licence or subscription for the gateway per customer environment; optional hosted
  verification and dashboard; the x402 price per privileged action can be kept by the customer or the operator.
- **On-chain costs per level-2 action:** about four transactions paid by the gateway (VRA, VAA, payment
  sponsorship, audit anchor) plus one per work order. Concordium fees are pegged to EUR cents, so the cost
  per action is predictable; level-0/1 actions add nothing beyond periodic anchors.

## 6. Risks

- Wallets may not display the consent context soon; mitigated by the provider-side page and ID App.
- Providers may resist a customer-side gateway; mitigated because the agent needs no change and the
  provider gains a selling point.
- New Concordium components may change their formats; mitigated by keeping each integration in one module
  (`agents.ts`, `verifier.ts`, `payments.ts`, `chain.ts`).
