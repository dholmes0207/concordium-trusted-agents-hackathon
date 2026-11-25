import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  AccountAddress, AccountTransactionType, CcdAmount, ContractAddress, Energy, Parameter, ReceiveName,
  TransactionExpiry, buildAccountSigner, parseWallet, signTransaction, type AccountTransaction,
} from '@concordium/web-sdk';
import { ConcordiumGRPCNodeClient, credentials } from '@concordium/web-sdk/nodejs';
import { KEYS_DIR, CCD_GRPC } from '@mandate-gate/core';

/** A sign-ready contract update as returned by the hosted Agent Registry MCP builders. */
export interface McpUpdatePayload {
  contract_address: { index: number; subindex: number };
  receive_name: string;
  parameter_hex: string;
  suggested_energy?: number;
  sender?: string;
}

export const client = () => new ConcordiumGRPCNodeClient(CCD_GRPC.host, CCD_GRPC.port, credentials.createSsl());

/** Loads a Browser Wallet `.export` from ~/ccd-keys; never prints key material. */
export function loadAccount(file: string) {
  const w = parseWallet(readFileSync(join(KEYS_DIR, file), 'utf8'));
  return { address: AccountAddress.fromBase58(w.value.address), signer: buildAccountSigner(w) };
}

export function describe(p: McpUpdatePayload) {
  return `${p.receive_name} on <${p.contract_address.index},${p.contract_address.subindex}>, parameter ${p.parameter_hex.length / 2} bytes, energy ${p.suggested_energy ?? 30000}, amount 0 CCD`;
}

/** Signs and submits the update with the given account key; waits for finalization. */
export async function submitUpdate(p: McpUpdatePayload, keyFile: string) {
  const c = client();
  const { address, signer } = loadAccount(keyFile);
  if (p.sender && p.sender !== AccountAddress.toBase58(address)) throw new Error(`payload built for ${p.sender}, key is for ${AccountAddress.toBase58(address)}`);
  const { nonce } = await c.getNextAccountNonce(address);
  const tx: AccountTransaction = {
    header: { sender: address, nonce, expiry: TransactionExpiry.futureMinutes(5) },
    type: AccountTransactionType.Update,
    payload: {
      amount: CcdAmount.zero(),
      address: ContractAddress.create(p.contract_address.index, p.contract_address.subindex),
      receiveName: ReceiveName.fromString(p.receive_name),
      message: Parameter.fromHexString(p.parameter_hex),
      maxContractExecutionEnergy: Energy.create(p.suggested_energy ?? 30000),
    },
  };
  const hash = await c.sendAccountTransaction(tx, await signTransaction(tx, signer));
  const outcome = await c.waitForTransactionFinalization(hash);
  const summary = outcome.summary as any;
  const ok = summary.type === 'accountTransaction' && summary.transactionType !== 'failed';
  return { txHash: hash.toString(), block: outcome.blockHash.toString(), ok, rejectReason: summary.rejectReason ?? null,
    explorer: `https://ccdexplorer.io/testnet/transaction/${hash.toString()}` };
}
