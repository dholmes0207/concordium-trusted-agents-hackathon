import canonicalizeImport from 'canonicalize';
import { createHash } from 'node:crypto';

const canonicalize = canonicalizeImport as unknown as (v: unknown) => string | undefined;

/** RFC 8785 (JCS) canonical JSON. Throws on values JSON cannot represent. */
export function canonicalJson(value: unknown): string {
  const out = canonicalize(value);
  if (out === undefined) throw new Error('value cannot be canonicalized');
  return out;
}

export function sha256(data: Uint8Array | string): Uint8Array {
  return new Uint8Array(createHash('sha256').update(data).digest());
}

/** SHA-256 over a domain tag followed by the canonical JSON of `value`. */
export function taggedHash(tag: string, value: unknown): Uint8Array {
  return sha256(`${tag}\n${canonicalJson(value)}`);
}

export const toHex = (b: Uint8Array) => Buffer.from(b).toString('hex');
export const fromHex = (h: string) => new Uint8Array(Buffer.from(h.replace(/^0x/, ''), 'hex'));
