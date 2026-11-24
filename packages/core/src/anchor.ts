import { Encoder, decode } from 'cbor-x';

/**
 * On-chain anchor format, modelled on Concordium's VRA/VAA anchors
 * (CBOR `{hash, type, version}`, observed on testnet in spike S3a).
 * Sent as the payload of a RegisterData transaction (max 256 bytes).
 */
export type AnchorType = 'MGATE-WO' | 'MGATE-WOREV' | 'MGATE-AUD';

export interface Anchor {
  type: AnchorType;
  version: 1;
  hash: Uint8Array; // 32 bytes
  seq?: number; // only for MGATE-AUD
}

export const REGISTER_DATA_MAX = 256;
const encoder = new Encoder({ useRecords: false, mapsAsObjects: true });

export function encodeAnchor(a: Anchor): Uint8Array {
  if (a.hash.length !== 32) throw new Error('anchor hash must be 32 bytes');
  const body: Record<string, unknown> = { hash: Buffer.from(a.hash), type: a.type, version: a.version };
  if (a.seq !== undefined) body.seq = a.seq;
  const bytes = new Uint8Array(encoder.encode(body));
  if (bytes.length > REGISTER_DATA_MAX) throw new Error(`anchor is ${bytes.length} bytes, max ${REGISTER_DATA_MAX}`);
  return bytes;
}

export function decodeAnchor(bytes: Uint8Array): Anchor {
  if (bytes.length > REGISTER_DATA_MAX) throw new Error('anchor too large');
  const v = decode(Buffer.from(bytes)) as Record<string, unknown>;
  if (typeof v !== 'object' || v === null) throw new Error('anchor is not a map');
  const type = v.type, version = v.version, hash = v.hash;
  if (type !== 'MGATE-WO' && type !== 'MGATE-WOREV' && type !== 'MGATE-AUD') throw new Error('unknown anchor type');
  if (version !== 1) throw new Error('unsupported anchor version');
  if (!(hash instanceof Uint8Array) || hash.length !== 32) throw new Error('bad anchor hash');
  const out: Anchor = { type, version: 1, hash: new Uint8Array(hash) };
  if (v.seq !== undefined) {
    if (typeof v.seq !== 'number' || !Number.isInteger(v.seq) || v.seq < 0) throw new Error('bad seq');
    out.seq = v.seq;
  }
  return out;
}
