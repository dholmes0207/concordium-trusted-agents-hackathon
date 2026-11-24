import { decodeAnchor, toHex } from '@mandate-gate/core';

/**
 * L2 chain index. Follows finalized blocks and records MandateGate anchors sent by the
 * trusted issuer accounts (company A): MGATE-WO marks a work order hash as issued,
 * MGATE-WOREV revokes it. Revocation is pull-based and fail-closed: if the index has not
 * seen a finalized block recently, `status()` answers `stale` and the gateway refuses.
 */
export interface RegisterDataEvent { sender: string; dataHex: string; txHash: string }
export interface FinalizedBlock { height: bigint; hash: string; events: RegisterDataEvent[] }

/** Source of finalized blocks; the real one wraps the Concordium gRPC client. */
export interface ChainSource { blocks(fromHeight?: bigint): AsyncIterable<FinalizedBlock> }

export type MandateStatus =
  | { status: 'active'; issuedAtHeight: bigint; txHash: string }
  | { status: 'revoked'; revokedAtHeight: bigint; txHash: string }
  | { status: 'unknown' }
  | { status: 'stale'; ageSeconds: number };

export class MandateIndex {
  private issued = new Map<string, { height: bigint; txHash: string; issuer: string }>();
  private revoked = new Map<string, { height: bigint; txHash: string }>();
  private lastBlockAt = 0; // local time (ms) the last finalized block was processed
  lastHeight: bigint = -1n;

  constructor(private trustedIssuers: Set<string>, private maxStalenessSeconds = 30, private clock = () => Date.now()) {}

  /** Feeds one finalized block (in order). */
  ingest(b: FinalizedBlock): void {
    for (const e of b.events) {
      if (!this.trustedIssuers.has(e.sender)) continue;
      let a;
      try { a = decodeAnchor(new Uint8Array(Buffer.from(e.dataHex, 'hex'))); } catch { continue; }
      const h = toHex(a.hash);
      if (a.type === 'MGATE-WO' && !this.issued.has(h)) this.issued.set(h, { height: b.height, txHash: e.txHash, issuer: e.sender });
      if (a.type === 'MGATE-WOREV') {
        // Only the issuer of a work order may revoke it; revocations of unknown orders are kept
        // (an order revoked before it is seen must never become active).
        const iss = this.issued.get(h);
        if (!iss || iss.issuer === e.sender) this.revoked.set(h, { height: b.height, txHash: e.txHash });
      }
    }
    this.lastHeight = b.height;
    this.lastBlockAt = this.clock();
  }

  status(woHash: string, issuer: string): MandateStatus {
    const age = (this.clock() - this.lastBlockAt) / 1000;
    if (this.lastBlockAt === 0 || age > this.maxStalenessSeconds) return { status: 'stale', ageSeconds: Math.round(age) };
    const rev = this.revoked.get(woHash);
    if (rev) return { status: 'revoked', revokedAtHeight: rev.height, txHash: rev.txHash };
    const iss = this.issued.get(woHash);
    if (!iss || iss.issuer !== issuer) return { status: 'unknown' };
    return { status: 'active', issuedAtHeight: iss.height, txHash: iss.txHash };
  }

  /** Runs the follow loop until the source ends or the signal aborts. */
  async follow(src: ChainSource, fromHeight?: bigint): Promise<void> {
    for await (const b of src.blocks(fromHeight)) this.ingest(b);
  }
}

/** Real chain source over the Concordium node gRPC API (testnet). */
export async function grpcChainSource(host: string, port: number): Promise<ChainSource> {
  const { ConcordiumGRPCNodeClient, credentials } = await import('@concordium/web-sdk/nodejs');
  const client = new ConcordiumGRPCNodeClient(host, port, credentials.createSsl());
  return {
    async *blocks(fromHeight?: bigint) {
      const iter = fromHeight !== undefined
        ? client.getFinalizedBlocksFrom({ value: fromHeight } as any)
        : client.getFinalizedBlocks();
      for await (const blk of iter as AsyncIterable<any>) {
        const events: RegisterDataEvent[] = [];
        for await (const item of client.getBlockTransactionEvents(blk.hash)) {
          const s = item as any;
          if (s.transactionType === 'registerData' && s.dataRegistered?.data) {
            events.push({ sender: s.sender.address, dataHex: s.dataRegistered.data, txHash: s.hash.toString() });
          }
        }
        yield { height: BigInt(blk.height.toString()), hash: blk.hash.toString(), events };
      }
    },
  };
}
