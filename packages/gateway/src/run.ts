import { Gateway, type GatewayConfig } from './gateway.js';
import { MandateIndex, pollingChainSource } from './mandates.js';
import { RegistryAgentVerifier } from './agents.js';
import { ApprovalService } from './approvals.js';
import { SdkApprovalBackend } from './verifier.js';
import { SerialQueue } from './txqueue.js';
import type { AnchorSender } from './anchorer.js';
import { CCD_GRPC, sendAnchor } from '@mandate-gate/core';

/** Builds a gateway from its config in chain mode: on-chain agent checks, mandate index, L3, L4. */
export async function startGateway(cfg: GatewayConfig, port: number, opts: { startHeight?: bigint } = {}) {
  const verifier = cfg.onboardedOwners?.length ? new RegistryAgentVerifier(new Set(cfg.onboardedOwners)) : undefined;
  let index: MandateIndex | undefined;
  if (cfg.mandates) {
    index = new MandateIndex(new Set(cfg.mandates.trustedIssuers), cfg.mandates.maxStalenessSeconds ?? 30);
    const src = await pollingChainSource(CCD_GRPC.host, CCD_GRPC.port);
    const from = opts.startHeight ?? (cfg.mandates.startHeight !== undefined ? BigInt(cfg.mandates.startHeight) : undefined);
    index.follow(src, from).catch((e) => console.error('chain follower stopped (gateway now fails closed):', e.message));
  }
  // One queue for every transaction sent from the gateway account (audit anchors, VRA, VAA, sponsorship).
  const txq = new SerialQueue();
  const key = cfg.gatewayAccountKey;
  const anchorSender: AnchorSender | undefined = key && cfg.audit ? (a) => txq.run(() => sendAnchor(a, key)) : undefined;
  const approvals = key && cfg.approvals
    ? new ApprovalService(new SdkApprovalBackend(key, txq, cfg.approvals.idpIndexes ?? [0]), cfg.approvals.holdSeconds ?? 300) : undefined;

  const gw = new Gateway(cfg, index, verifier, anchorSender, approvals);
  gw.onApprovalPending = (p, url) => console.log(`\n⏸  ${p.subject.action} on ${p.subject.resource} is waiting for approval (${cfg.approvals?.holdSeconds ?? 300} s):\n   ${url}\n   ${p.consent}\n`);
  const server = await gw.listen(port);
  console.log(`MandateGate listening on http://127.0.0.1:${port}/mcp (audience ${cfg.audience})` +
    `${approvals ? ', approvals on' : ''}${anchorSender ? ', audit anchors on' : ''}`);
  return { gw, server, index, txq };
}
