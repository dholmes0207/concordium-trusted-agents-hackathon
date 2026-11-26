# Concordium integration

> Judging focuses on **integration depth** and a **credible path to production**. This page is the
> evidence: for each component, what it does in MandateGate and the proof on testnet.

## Network and accounts

| | |
|---|---|
| Network | Concordium **testnet** (`ccd:4221332d34e1694168c2a0c0b3fd0f27`), gRPC `grpc.testnet.concordium.com:20000` |
| Agent | **#1505** in the Agent Registry (CIS-8004 `<12802,0>`), badge `JyP9Y8gnY2peWyyQMsrAk` |
| Agent Card | [agent-card/mandate-gate-devops-agent.json](../agent-card/mandate-gate-devops-agent.json), served from [raw.githubusercontent.com](https://raw.githubusercontent.com/dholmes0207/concordium-trusted-agents-hackathon/main/agent-card/mandate-gate-devops-agent.json), SHA-256 pinned on chain |
| Live verification page | https://dholmes0207.github.io/concordium-trusted-agents-hackathon/ (six checks run in the visitor's browser) |
| Company A (agent owner, work-order issuer) | [`3zKuq9cg…oXoNL6s`](https://ccdexplorer.io/testnet/account/3zKuq9cgzYgSs1cXE2ugGq3WkBNkPsAChj1fLSH8HhoQXoNL6s) |
| Customer B (gateway, fee sponsor, payment recipient) | [`2zmbEkwH…QLWch8`](https://ccdexplorer.io/testnet/account/2zmbEkwHcYCMz6369NicRQmu1bpxGS33KRM2PE4QAxUfQLWch8) |
| Agent wallet (x402 payer) | [`4WZGyWnH…6gZxPCaYb9`](https://ccdexplorer.io/testnet/account/4WZGyWnHBfXRPpv2BZLcXt3AKQADYjkpwNxkb6DL6gZxPCaYb9) |
| Agent signing key | EVM `0xA3198Ee065B9f633aa36030C34310836Bf37c650` (`eip155:84532`), bound with CIS-8 |

## Components

### Agent Registry (CIS-8004) and Agent Card
- **Why:** the customer must know which agent is calling and who is accountable for it before anything runs.
- **How:** the agent was registered by script (`spikes/s0-agent-key`), its card hosted in this repo and its
  hash pinned with `setAgentURI`. On every call the gateway (`packages/gateway/src/agents.ts`) asks the hosted
  Agent Registry MCP (`agent-registry-mcp.concordium.com/mcp`) for `agent_of`, `check_badge` and the card
  hash, and refuses agents that are inactive, whose card bytes changed, or whose owner the customer has
  not onboarded. Level-2 actions re-check without cache.
- **Evidence:** [register](https://ccdexplorer.io/testnet/transaction/105b018650e557f75b1ebd940be2c2f5a2594b84ff2f80c8bd0558b24991bb65) ·
  [pin card](https://ccdexplorer.io/testnet/transaction/50eb19421df3173f9b2664f754d8d7a522b1d2aeaae594f53a91b2f583b72eba)

### Verified by Concordium badge
- **Why:** one public, checkable signal that the registry entry, card URL, card bytes and owner agree.
- **How:** `check_badge` result is part of the L1 decision; the public page re-runs the checks in the browser.
- **Evidence:** `GET agent-registry-mcp.concordium.com/v1/check-badge/JyP9Y8gnY2peWyyQMsrAk?network=testnet` → `badge_valid: true`.

### CIS-8 external key binding (cross-chain identity)
- **Why:** the agent signs requests with an EVM key (it can keep one identity across chains), and the
  gateway must know that key belongs to the agent's owner.
- **How:** every request is an EIP-191 signature over a canonical JSON envelope (domain `MGATE/v1/request`);
  the gateway recovers the public key and checks on chain that its CIS-8 owner is the agent's owner.
  A different key claiming to be #1505 is denied (`agent_key_owner_differs_from_agent_owner`, seen live).
- **Evidence:** [CIS-8 binding](https://ccdexplorer.io/testnet/transaction/d219aef839d039136d67160d0053b83c90b7b86fb46c850f3f20fdbea39dd72a)

### Register Data anchors (work orders, revocations, audit)
- **Why:** the customer needs proof that the agent's owner authorised *this* scope, that it was not
  withdrawn, and that the gateway's records were not edited afterwards.
- **How:** CBOR `{hash, type, version}` payloads: `MGATE-WO` (hash of the JCS-canonical work order),
  `MGATE-WOREV` (revocation), `MGATE-AUD` (`{hash, seq}` of the audit head). The gateway follows finalized
  blocks by height, keeps a mandate index from trusted issuers, and fails closed when its view is older
  than 60 s. Revocations take effect about 15 s after finality. `verify-audit` recomputes the hash chain and
  checks every anchor on chain.
- **Evidence:** work order [sponsored issue](https://ccdexplorer.io/testnet/transaction/ffd8f75ffddebc1719a0d551dc53e1053532b8572c8e74c1687b35b46bd19030) ·
  [revocation](https://ccdexplorer.io/testnet/transaction/aa1cac7f1a2eb1802faedfef223ad35be2c990dba284a978ab33516cbe2c4ab9) ·
  demo work order [cf3f74e7…](https://ccdexplorer.io/testnet/transaction/cf3f74e7d60829c4c766134f6acd8bbc36eef50b7b0ce4118d15180192429b56) ·
  audit anchors [982d5ba2…](https://ccdexplorer.io/testnet/transaction/982d5ba23ab136a3fc4327aa703bd7ac5303a87734f487b9cb9fbd8cd250cb6d) (before the deploy) and
  [f4b0f60a…](https://ccdexplorer.io/testnet/transaction/f4b0f60a4a1c8e84dfb096c3e69a6941e42505d7fe7bdc0de6946467c1460b09) (at shutdown, records 0–43)

### Concordium ID: Verify & Access V1 (human approval)
- **Statement requested:** an **account-based** credential from the testnet identity provider, age ≥ 18
  (a minimal statement; the point is a verified person and a stable credential id, not personal data).
- **Binding to the action:** `ResourceID` = approval digest D over audience, agent, work order, request,
  action, resource, params hash, nonce and expiry; `ConnectionID` = approval id; `ContextString` = the consent
  sentence. The request is anchored (VRA) by the gateway; spike S3a showed that changing only `ResourceID`
  changes the anchored hash. The gateway checks the presentation with `VerificationAuditRecordV1.createChecked`,
  requires `ResourceID == D` and an account credential, and anchors the audit record (VAA).
- **Why minimal disclosure matters here:** the provider's engineers approve actions on the customer's
  systems; the customer needs accountability (a stable credential id, verified issuer, optionally matched
  to a salted commitment in the work order) without collecting names or documents.
- **Evidence (live, Browser Wallet):** first run [VRA](https://ccdexplorer.io/testnet/transaction/0ac27871fda1d2b975d3a98dfbe2e83937cfe32ae18c7b41599dbd3cd7633227) →
  [VAA](https://ccdexplorer.io/testnet/transaction/ad4768043e829c66ef2c2c269fab3cb011eb3fa7dc5c789f573e193c452b241d) →
  [audit anchor](https://ccdexplorer.io/testnet/transaction/29908ace3784c9af96670eb11cf7a4ed8c24dc9f6b7a5ed355c2c0bd636bf37d) → deploy;
  Claude Code run [VRA](https://ccdexplorer.io/testnet/transaction/b4fadf927a88c26f46966aa5a2054060de9b8327b03fca75fabf1fe25fe259a8) →
  [VAA](https://ccdexplorer.io/testnet/transaction/1e77c5001816b5e0576eec7f4275ed64603c050583c783d5d4f2aaa40bd3de96).
- **Limit found:** the Browser Wallet does not display the request context, so the approval page shows the
  action and the digest; we call the result *approval evidence*. ID App approval is the next step.

### Payments: x402 with sponsored transactions
- **Why:** privileged actions have a cost and the agent's spending needs a hard cap the customer can see.
- **How:** `@x402/concordium` exact scheme. Level-2 calls without payment get `payment_required`
  (0.5 CCD to B, fee payer B). The proxy signs a V1 sponsored transfer from the agent wallet; the gateway,
  acting as facilitator, verifies it (9 rules) before the approval hold, and settles it (B co-signs as
  sponsor, pays the fee, waits for finality) only after approval, just before execution. The budget per
  work order (10 CCD by default) is enforced by both the gateway and the proxy; a payment cannot be reused.
- **Evidence:** [payment in the Claude Code run](https://ccdexplorer.io/testnet/transaction/0f1a6ba92cc538fa1d9861d0777ecbe6f8354395006232e2fda84fe42d541425) ·
  [smoke test](https://ccdexplorer.io/testnet/transaction/ec5f414e40bf801bd8f833464ba1c247a108a2547292c95e87eafe2474e32cb4)

### Sponsored transactions (fees paid by the customer's gateway)
- **Why:** neither the agent nor the engineer should need CCD for fees; the party that benefits from the
  checks pays for them.
- **How:** `Transaction.registerData(...).addSponsor(B)`; company A signs, the gateway co-signs as sponsor.
- **Evidence:** [work order sponsored by B](https://ccdexplorer.io/testnet/transaction/ffd8f75ffddebc1719a0d551dc53e1053532b8572c8e74c1687b35b46bd19030), x402 payments above.

### MCP
- **Why:** agents already speak MCP; MandateGate adds trust without changing them.
- **How:** the agent talks stdio MCP to `agent-proxy`; the proxy talks streamable-HTTP MCP to the gateway with
  the same six tools plus a signed `auth` field. The gateway uses the hosted Agent Registry MCP for L1.

### Smart contracts
None of our own: MandateGate uses Concordium's deployed Agent Registry (`<12802,0>`) and CIS-8 key registry
(`<12801,0>`), and protocol-level features (Register Data, sponsored transactions, Verify & Access).

## All on-chain links

| What | Transaction |
|---|---|
| Agent #1505 registered | [105b0186…](https://ccdexplorer.io/testnet/transaction/105b018650e557f75b1ebd940be2c2f5a2594b84ff2f80c8bd0558b24991bb65) |
| Agent Card pinned | [50eb1942…](https://ccdexplorer.io/testnet/transaction/50eb19421df3173f9b2664f754d8d7a522b1d2aeaae594f53a91b2f583b72eba) |
| CIS-8 key binding | [d219aef8…](https://ccdexplorer.io/testnet/transaction/d219aef839d039136d67160d0053b83c90b7b86fb46c850f3f20fdbea39dd72a) |
| Work order (sponsored) | [ffd8f75f…](https://ccdexplorer.io/testnet/transaction/ffd8f75ffddebc1719a0d551dc53e1053532b8572c8e74c1687b35b46bd19030) |
| Work order revocation | [aa1cac7f…](https://ccdexplorer.io/testnet/transaction/aa1cac7f1a2eb1802faedfef223ad35be2c990dba284a978ab33516cbe2c4ab9) |
| Demo work order (Claude Code run) | [cf3f74e7…](https://ccdexplorer.io/testnet/transaction/cf3f74e7d60829c4c766134f6acd8bbc36eef50b7b0ce4118d15180192429b56) |
| Approval request (VRA) | [b4fadf92…](https://ccdexplorer.io/testnet/transaction/b4fadf927a88c26f46966aa5a2054060de9b8327b03fca75fabf1fe25fe259a8) |
| Approval verified (VAA) | [1e77c500…](https://ccdexplorer.io/testnet/transaction/1e77c5001816b5e0576eec7f4275ed64603c050583c783d5d4f2aaa40bd3de96) |
| x402 payment 0.5 CCD | [0f1a6ba9…](https://ccdexplorer.io/testnet/transaction/0f1a6ba92cc538fa1d9861d0777ecbe6f8354395006232e2fda84fe42d541425) |
| Audit anchor before deploy | [982d5ba2…](https://ccdexplorer.io/testnet/transaction/982d5ba23ab136a3fc4327aa703bd7ac5303a87734f487b9cb9fbd8cd250cb6d) |
| Audit anchor at shutdown | [f4b0f60a…](https://ccdexplorer.io/testnet/transaction/f4b0f60a4a1c8e84dfb096c3e69a6941e42505d7fe7bdc0de6946467c1460b09) |
| S3a: ResourceID bound to the VRA anchor | [bcfb716f…](https://ccdexplorer.io/testnet/transaction/bcfb716f9d899b5b49faf1ec1e63c6090cc6693a2ac599d849ad1953e8a67861) |
