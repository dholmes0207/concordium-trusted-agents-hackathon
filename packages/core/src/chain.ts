import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AccountAddress, DataBlob, Transaction, TransactionExpiry, buildAccountSigner, parseWallet,
} from '@concordium/web-sdk';
import { ConcordiumGRPCNodeClient, credentials } from '@concordium/web-sdk/nodejs';
import { KEYS_DIR, CCD_GRPC } from './config.js';
import { encodeAnchor, decodeAnchor, type Anchor } from './anchor.js';
import { toHex } from './canonical.js';

export const grpc = () => new ConcordiumGRPCNodeClient(CCD_GRPC.host, CCD_GRPC.port, credentials.createSsl());

/** Loads a Browser Wallet `.export` from ~/ccd-keys. Key material is never printed. */
export function loadAccount(file: string) {
  const w = parseWallet(readFileSync(join(KEYS_DIR, file), 'utf8'));
  return { address: AccountAddress.fromBase58(w.value.address), signer: buildAccountSigner(w), base58: w.value.address };
}

export interface AnchorResult {
  txHash: string; block: string; height?: string; sender: string; sponsor: string | null; costCcd: string | null; explorer: string;
}

/**
 * Sends a MandateGate anchor as a RegisterData transaction from `senderKey`.
 * With `sponsorKey`, the transaction is a V1 sponsored transaction: the sender signs as
 * sender, the sponsor signs as sponsor and pays the fee (Workshop 5: every type can be sponsored).
 */
export async function sendAnchor(anchor: Anchor, senderKey: string, sponsorKey?: string): Promise<AnchorResult> {
  const r = await sendRegisterData(encodeAnchor(anchor), senderKey, sponsorKey);
  const back = decodeAnchor(r.data);
  if (toHex(back.hash) !== toHex(anchor.hash) || back.type !== anchor.type) throw new Error('anchor read back does not match');
  return r.result;
}

/** Sends raw bytes (≤ 256) as RegisterData; returns the result and the bytes read back from chain. */
export async function sendRegisterData(bytes: Uint8Array, senderKey: string, sponsorKey?: string): Promise<{ result: AnchorResult; data: Uint8Array }> {
  const c = grpc();
  const sender = loadAccount(senderKey);
  const blob = new DataBlob(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer);
  const { nonce } = await c.getNextAccountNonce(sender.address);
  const configured = Transaction.registerData({ data: blob }).addMetadata({ sender: sender.address, nonce, expiry: TransactionExpiry.futureMinutes(5) });

  let finalized;
  let sponsorB58: string | null = null;
  if (sponsorKey) {
    const sponsor = loadAccount(sponsorKey);
    sponsorB58 = sponsor.base58;
    const unsigned = configured.addSponsor(sponsor.address).build();
    const senderSigned = await Transaction.sign(unsigned, sender.signer);
    const bothSigned = await Transaction.sponsor(senderSigned as typeof unsigned, sponsor.signer);
    finalized = Transaction.finalize(bothSigned);
  } else {
    finalized = await Transaction.signAndFinalize(configured.build(), sender.signer);
  }
  const hash = await c.sendTransaction(finalized);
  const outcome = await c.waitForTransactionFinalization(hash);
  const s = outcome.summary as any;
  if (s.transactionType !== 'registerData') throw new Error(`transaction failed: ${JSON.stringify(s.rejectReason ?? s).slice(0, 300)}`);
  const data = new Uint8Array(Buffer.from(s.dataRegistered.data, 'hex'));
  if (toHex(data) !== toHex(bytes)) throw new Error('registered data read back does not match');
  const cost = s.cost !== undefined ? (Number(BigInt(s.cost.microCcdAmount ?? s.cost)) / 1e6).toString() : null;
  return { data, result: {
    txHash: hash.toString(), block: outcome.blockHash.toString(), sender: sender.base58, sponsor: sponsorB58, costCcd: cost,
    explorer: `https://ccdexplorer.io/testnet/transaction/${hash.toString()}`,
  } };
}
