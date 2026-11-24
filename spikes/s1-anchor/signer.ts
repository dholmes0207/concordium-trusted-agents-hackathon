import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { AccountAddress, buildBasicAccountSigner, parseWallet, buildAccountSigner, type AccountSigner } from '@concordium/web-sdk';
import { KEYS_DIR } from '@mandate-gate/core';

/**
 * Loads a testnet account key exported from the Concordium Wallet for Web, from ~/ccd-keys.
 * Accepts the JSON `.export` file, or a file holding only the hex sign key plus the address
 * given in CCD_SENDER. The key is never printed.
 */
export function loadAccountSigner(name: string): { address: AccountAddress.Type; signer: AccountSigner } {
  const raw = readFileSync(join(KEYS_DIR, name), 'utf8').trim();
  if (raw.startsWith('{')) {
    const wallet = parseWallet(raw);
    return { address: AccountAddress.fromBase58(wallet.value.address), signer: buildAccountSigner(wallet) };
  }
  const sender = process.env.CCD_SENDER;
  if (!sender) throw new Error('hex key file needs CCD_SENDER=<account address>');
  return { address: AccountAddress.fromBase58(sender), signer: buildBasicAccountSigner(raw) };
}
