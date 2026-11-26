import { readFileSync, existsSync } from 'node:fs';
import type { PaymentPayload, PaymentRequirements } from '@x402/core/types';
import { ExactConcordiumScheme } from '@x402/concordium/exact/facilitator';
import { toConcordiumFacilitatorSigner } from '@x402/concordium';
import { CCD_GRPC, CCD_TESTNET_CAIP2, loadAccount } from '@mandate-gate/core';
import type { SerialQueue } from './txqueue.js';

/**
 * x402 extension: level-2 actions cost a fixed price in CCD, paid from the agent's own wallet,
 * capped by the work order's budget. The gateway runs its own facilitator: the agent's payment is a
 * V1 sponsored transfer signed by the agent wallet only; the gateway account (customer B) verifies it
 * (9 rules), co-signs as sponsor (pays the fee), submits it and waits for finalization.
 *
 * Order in the pipeline: verified before the approval hold (a bad payment never bothers a human),
 * settled only after approval and just before execution (a rejected action costs nothing; the
 * unsettled transaction simply expires).
 */
export interface PaymentsConfig {
  /** Price of one level-2 action in microCCD, e.g. "500000" = 0.5 CCD. */
  priceMicroCcd: string;
  /** Recipient (customer B). */
  payTo: string;
  /** Seconds the signed transfer stays valid: hold time + margin, at most 600 (facilitator rule 7). */
  maxTimeoutSeconds?: number;
}

export interface PaymentProcessor {
  requirements(): PaymentRequirements;
  verify(payload: PaymentPayload, req: PaymentRequirements): Promise<{ ok: true; payer: string } | { ok: false; reason: string }>;
  settle(payload: PaymentPayload, req: PaymentRequirements): Promise<{ ok: true; payer: string; txHash: string } | { ok: false; reason: string }>;
}

/** Real facilitator on Concordium testnet, sponsoring with the gateway account. */
export class X402Processor implements PaymentProcessor {
  private scheme: ExactConcordiumScheme;
  private sponsor: string;
  constructor(private cfg: PaymentsConfig, gatewayKeyFile: string, private queue: SerialQueue) {
    const acct = loadAccount(gatewayKeyFile);
    this.sponsor = acct.base58;
    const signer = toConcordiumFacilitatorSigner(acct.base58, acct.signer, {
      host: CCD_GRPC.host, port: CCD_GRPC.port, useTls: true, network: CCD_TESTNET_CAIP2 as `${string}:${string}`,
    });
    this.scheme = new ExactConcordiumScheme({ signer, requireFinalization: true, finalizationTimeoutMs: 60_000 });
  }
  requirements(): PaymentRequirements {
    return {
      scheme: 'exact', network: CCD_TESTNET_CAIP2 as `${string}:${string}`, asset: 'CCD', amount: this.cfg.priceMicroCcd,
      payTo: this.cfg.payTo, maxTimeoutSeconds: this.cfg.maxTimeoutSeconds ?? 540, extra: { feePayer: this.sponsor },
    };
  }
  async verify(payload: PaymentPayload, req: PaymentRequirements) {
    const v = await this.scheme.verify(payload, req);
    return v.isValid ? { ok: true as const, payer: v.payer ?? '' } : { ok: false as const, reason: v.invalidReason ?? 'invalid_payment' };
  }
  async settle(payload: PaymentPayload, req: PaymentRequirements) {
    // The sponsor signature uses the gateway account's nonce: same queue as anchors, VRA and VAA.
    const s = await this.queue.run(() => this.scheme.settle(payload, req));
    return s.success ? { ok: true as const, payer: s.payer ?? '', txHash: s.transaction } : { ok: false as const, reason: s.errorReason ?? 'settle_failed' };
  }
}

/** Spend per work order, rebuilt from the audit log on start (records of kind "payment"). */
export class BudgetBook {
  private spent = new Map<string, bigint>();
  private used = new Set<string>(); // sender signatures of payments already settled or in flight
  constructor(auditFile?: string) {
    if (auditFile && existsSync(auditFile)) {
      for (const l of readFileSync(auditFile, 'utf8').split('\n')) {
        if (!l.trim()) continue;
        const r = JSON.parse(l) as { kind: string; data: { workOrderHash?: string; amountMicroCcd?: string; signature?: string } };
        if (r.kind === 'payment' && r.data.workOrderHash && r.data.amountMicroCcd) {
          this.add(r.data.workOrderHash, BigInt(r.data.amountMicroCcd));
          if (r.data.signature) this.used.add(r.data.signature);
        }
      }
    }
  }
  spentOf(wo: string) { return this.spent.get(wo) ?? 0n; }
  add(wo: string, amount: bigint) { this.spent.set(wo, this.spentOf(wo) + amount); }
  /** Marks a payment's sender signature as used; false if it was used before (replay). */
  claim(sig: string) { if (this.used.has(sig)) return false; this.used.add(sig); return true; }
  release(sig: string) { this.used.delete(sig); }
}

/** A stable id for a payment payload: the sender's signature over the transaction. */
export function paymentSignature(payload: PaymentPayload): string {
  const tx = (payload.payload as { signedTransaction?: { signatures?: { sender?: unknown } } }).signedTransaction;
  return JSON.stringify(tx?.signatures?.sender ?? null);
}
