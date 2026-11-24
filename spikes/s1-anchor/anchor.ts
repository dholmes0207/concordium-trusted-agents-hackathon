// Spike S1: put a MandateGate anchor on testnet with a RegisterData transaction and read it back.
// Usage:
//   pnpm anchor                                  # dry run: build and print the CBOR anchor only
//   pnpm anchor --submit company-A.export        # sign with ~/ccd-keys/company-A.export and send
// Sponsored submission (gateway-B pays the fee) is added once both accounts exist.
import {
  AccountTransactionType, DataBlob, TransactionExpiry, signTransaction,
  type AccountTransaction,
} from '@concordium/web-sdk';
import { ConcordiumGRPCNodeClient, credentials } from '@concordium/web-sdk/nodejs';
import { encodeAnchor, decodeAnchor, taggedHash, toHex, CCD_GRPC } from '@mandate-gate/core';
import { loadAccountSigner } from './signer.js';

const submitIdx = process.argv.indexOf('--submit');
const keyFile = submitIdx >= 0 ? process.argv[submitIdx + 1] : undefined;

// A sample work order hash (L2 builds the real one).
const sampleWorkOrder = { v: 1, id: 'wo_spike_s1', note: 'spike S1 sample', at: new Date().toISOString() };
const hash = taggedHash('MGATE/v1/work-order', sampleWorkOrder);
const bytes = encodeAnchor({ type: 'MGATE-WO', version: 1, hash });
console.log('anchor bytes :', bytes.length, 'bytes (max 256)');
console.log('anchor hex   :', toHex(bytes));
console.log('decoded      :', { ...decodeAnchor(bytes), hash: toHex(decodeAnchor(bytes).hash) });

if (!keyFile) { console.log('\nDry run only. Pass --submit <key file in ~/ccd-keys> to send it.'); process.exit(0); }

const client = new ConcordiumGRPCNodeClient(CCD_GRPC.host, CCD_GRPC.port, credentials.createSsl());
const { address, signer } = loadAccountSigner(keyFile);
const { nonce } = await client.getNextAccountNonce(address);
const tx: AccountTransaction = {
  header: { sender: address, nonce, expiry: TransactionExpiry.futureMinutes(5) },
  type: AccountTransactionType.RegisterData,
  payload: { data: new DataBlob(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer) },
};
const signature = await signTransaction(tx, signer);
const txHash = await client.sendAccountTransaction(tx, signature);
console.log('\nsubmitted    :', txHash.toString());
const outcome = await client.waitForTransactionFinalization(txHash);
console.log('finalized in :', outcome.blockHash.toString());
const summary = outcome.summary as { transactionType?: string; dataRegistered?: { data: string } };
const back = decodeAnchor(new Uint8Array(Buffer.from(summary.dataRegistered!.data, 'hex')));
console.log('read back    :', summary.transactionType, back.type, toHex(back.hash) === toHex(hash) ? 'hash MATCH' : 'hash MISMATCH');
console.log('explorer     :', `https://ccdexplorer.io/testnet/transaction/${txHash.toString()}`);
