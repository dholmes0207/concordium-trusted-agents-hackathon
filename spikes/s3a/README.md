# Spike S3a: Verify & Access V1 with an account credential (24/11/2026)

Goal: find out whether the Concordium Wallet for Web answers a Verify & Access V1 request with an
**account-based** proof, what the wallet shows to the user, what identifiers the proof carries, and
whether the request context (`ResourceID`) is bound to the on-chain anchor.

## How it was run

1. `web3id-proof-explorer.testnet.concordium.com` (Proof explorer 2.2.0), Browser Wallet on testnet.
2. Right-hand column (V1 flow): issuer **Concordium testnet IP** (idp 0), statement **Prove older than 18**.
3. *Select Credential Type Source* = **Account only**.
4. **Submit Anchor Transaction** (signed in the wallet) → **ProveV1** with *Use verifier service* on → **Approve**.
5. Result: **Proof OK**. Raw presentation copied out of the page.

## Results

| Question | Result |
|---|---|
| Wallet answers V1 with an account credential? | ✅ **Yes.** The popup lets the user pick the account (`3Rgk…6gaw - Identity 1`) |
| What the wallet shows | Requesting site, account, and the statement in plain words (*"Age: 18 years or older… Date of birth between January 01, 1800 and November 25, 2008"*). Buttons Reject / Approve |
| Does the wallet show the context (`ResourceID`, `ConnectionID`)? | ❌ **No.** Nothing from the context is displayed |
| VRA anchor | Testnet tx `bcfb716f9d899b5b49faf1ec1e63c6090cc6693a2ac599d849ad1953e8a67861`, finalized, type `registerData`, sent by the verifier's account, about 4.38 test CCD; data = CBOR `{hash, type: "CCDVRA", version: 1}` |
| Is `ResourceID` bound to the anchor? | ✅ **Yes.** `recompute-anchor.mjs` rebuilds the request from the presentation's context and claims: the hash **matches** the on-chain anchor; changing only `ResourceID` gives a different hash |
| Presentation ↔ anchor link | The presentation's `requested` context contains **BlockHash** = the block of the VRA anchor (`5c5dd4be…`) |
| Identifier in the proof | `credentialSubject.id = did:ccd:testnet:cred:<credId>`: the **stable account credential ID** |
| Type strings | Presentation `ConcordiumVerifiablePresentationV1`; credential `ConcordiumAccountBasedCredential`; proof `ConcordiumZKProofV4`; outer proof `ConcordiumWeakLinkingProofV1`; issuer `did:ccd:testnet:idp:0` |
| Extra wallet prompts | None after Approve (the verifier service handled the result) |

## Consequences for the design

| Item | Decision |
|---|---|
| **D3: approval route** | ✅ **MVP-C is feasible.** The gateway puts `D` (digest of the action) in `ResourceID`, anchors the request (VRA), and checks that the presentation's `credId` opens the approver commitment in the work order |
| **AB1 (bound to the action)** | ✅ Via the anchor: `D` in `ResourceID` → anchor hash; presentation names the anchor block |
| **AB3 (right person)** | ✅ `credId` is stable and comes from the verified presentation |
| **Consent display** | ❌ The wallet does not show `D` or any text from the context. The action must be shown on **company A's approval page**, which recomputes `D` before calling the wallet. Call the result **"approval evidence"**, not "verifiable consent" |
| **G2 (what leaks)** | Account-based proof leaks the account credential ID (public on chain, pseudonymous) and the IdP; no name or date of birth |
| **Cost** | Each approval = 1 VRA anchor (~4.4 test CCD); can be sponsored (W5) |

## Re-run

```bash
npm install
node recompute-anchor.mjs <anchorTxHash> <nonceHex> "<ConnectionID>" "<ResourceID>"
```

The raw presentation is not committed (it contains the tester's account credential ID).
