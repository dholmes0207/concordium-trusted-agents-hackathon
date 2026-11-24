import { appendFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import { canonicalJson, sha256, toHex } from './canonical.js';

/**
 * L4 audit log (first version): append-only JSON lines, each record carries the hash of
 * the previous one and a random nonce, so the chain is tamper-evident and short records
 * cannot be guessed from their hash. Anchoring the head hash on chain comes with spike S1.
 */
export type AuditKind = 'request' | 'decision' | 'approval' | 'execution' | 'revocation' | 'payment' | 'denied_batch';

export interface AuditRecord {
  seq: number;
  at: string;
  kind: AuditKind;
  prev: string; // hex hash of previous record, "00..." for the first
  nonce: string;
  data: Record<string, unknown>;
  hash: string; // hex sha256 of the record without this field
}

const ZERO = '0'.repeat(64);
const recordHash = (r: Omit<AuditRecord, 'hash'>) => toHex(sha256(`MGATE/v1/audit\n${canonicalJson(r)}`));

export class AuditLog {
  private head = ZERO;
  private seq = 0;
  constructor(private file: string) {
    mkdirSync(dirname(file), { recursive: true });
    if (existsSync(file)) {
      const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
      if (lines.length) {
        const last = JSON.parse(lines[lines.length - 1]) as AuditRecord;
        this.head = last.hash;
        this.seq = last.seq + 1;
      }
    }
  }

  append(kind: AuditKind, data: Record<string, unknown>): AuditRecord {
    const base = { seq: this.seq, at: new Date().toISOString(), kind, prev: this.head, nonce: randomBytes(16).toString('hex'), data };
    const rec: AuditRecord = { ...base, hash: recordHash(base) };
    appendFileSync(this.file, JSON.stringify(rec) + '\n'); // write before returning (fail-closed callers)
    this.head = rec.hash;
    this.seq += 1;
    return rec;
  }

  get headHash() { return this.head; }
}

/** Recomputes the chain; returns the index of the first broken record, or -1 if intact. */
export function verifyAuditFile(file: string): { ok: boolean; brokenAt: number; records: number } {
  const lines = readFileSync(file, 'utf8').split('\n').filter((l) => l.trim());
  let prev = ZERO;
  for (let i = 0; i < lines.length; i++) {
    const r = JSON.parse(lines[i]) as AuditRecord;
    const { hash, ...rest } = r;
    if (r.prev !== prev || recordHash(rest) !== hash || r.seq !== i) return { ok: false, brokenAt: i, records: lines.length };
    prev = hash;
  }
  return { ok: true, brokenAt: -1, records: lines.length };
}
