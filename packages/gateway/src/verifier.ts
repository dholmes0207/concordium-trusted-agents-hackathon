import {
  VerificationRequestV1, VerifiablePresentationV1, VerificationAuditRecordV1, IdentityProviderDID,
} from '@concordium/web-sdk';
import { grpc, loadAccount } from '@mandate-gate/core';
import type { ApprovalBackend, PendingApproval } from './approvals.js';
import type { SerialQueue } from './txqueue.js';

/**
 * Real L3 backend on Concordium testnet:
 *  - request: Verify & Access V1 with ResourceID = approval digest D, ConnectionID = approval id,
 *    ContextString = the consent sentence; account-credential claim (age ≥ 18) from the allowed IdPs;
 *    anchored as a VRA by the gateway's account.
 *  - verification: VerificationAuditRecordV1.createChecked (presentation matches the anchored request,
 *    ZK proofs valid against the chain), plus explicit checks that ResourceID is D and the credential
 *    is account based; the audit record is then anchored as a VAA.
 */
export class SdkApprovalBackend implements ApprovalBackend {
  private requests = new Map<string, VerificationRequestV1.Type>();
  constructor(private gatewayKeyFile: string, private queue: SerialQueue, private idpIndexes: number[] = [0]) {}

  async createRequest(p: PendingApproval) {
    const acct = loadAccount(this.gatewayKeyFile);
    const ctx = VerificationRequestV1.createSimpleContext(new Uint8Array(Buffer.from(p.subject.nonce, 'hex')), p.id, p.digest, p.consent);
    const { type: _type, ...context } = ctx;
    const claims = VerificationRequestV1.claimsBuilder()
      .addAccountClaims(this.idpIndexes.map((i) => new IdentityProviderDID('Testnet', i)), (b) => b.addMinimumAge(18))
      .getClaims();
    const req = await this.queue.run(() =>
      VerificationRequestV1.createAndAnchor(grpc(), { sender: acct.address, signer: acct.signer }, context, claims, { mgate: 'approval' }));
    this.requests.set(p.id, req);
    return { requestJson: req.toJSON(), vraTx: req.transactionRef.toString() };
  }

  async verifyPresentation(p: PendingApproval, presentationJson: unknown) {
    const req = this.requests.get(p.id);
    if (!req) throw new Error('request not found');
    const pres = VerifiablePresentationV1.fromJSON(presentationJson as any);
    const pj = JSON.parse(JSON.stringify(pres.toJSON())) as any;
    const given = (pj.presentationContext?.given ?? []) as Array<{ label: string; context: string }>;
    if (given.find((g) => g.label === 'ResourceID')?.context !== p.digest) throw new Error('resource_id_is_not_the_action_digest');
    const cred = pj.verifiableCredential?.[0];
    if (!cred || !(cred.type ?? []).includes('ConcordiumAccountBasedCredential')) throw new Error('account_credential_required');

    const checked = await VerificationAuditRecordV1.createChecked(p.id, req, pres, grpc(), 'Testnet');
    if (checked.type !== 'success') throw checked.error;

    let vaaTx: string | undefined;
    try {
      const acct = loadAccount(this.gatewayKeyFile);
      vaaTx = (await this.queue.run(() =>
        VerificationAuditRecordV1.registerAnchor(checked.result, grpc(), { sender: acct.address, signer: acct.signer }, { mgate: 'approval' }))).toString();
    } catch { /* the approval stands; the VAA is retried by the audit anchor */ }
    return { credentialId: String(cred.credentialSubject.id), issuer: String(cred.issuer), vaaTx };
  }
}
