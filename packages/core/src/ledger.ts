import { appendFileSync, existsSync, readFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

/**
 * Idempotency ledger for request ids (L1). Reservation is a synchronous check-and-set,
 * which is atomic in Node's single-threaded event loop; entries are appended to a file
 * so a restarted gateway still refuses replays.
 */
export type ReserveResult = 'reserved' | 'duplicate' | 'conflict';

interface Entry { requestHash: string; state: 'reserved' | 'done' | 'failed'; expiresAt: number }

export class RequestLedger {
  private entries = new Map<string, Entry>();
  constructor(private file?: string) {
    if (file && existsSync(file)) {
      for (const line of readFileSync(file, 'utf8').split('\n')) {
        if (!line.trim()) continue;
        const e = JSON.parse(line) as { id: string } & Entry;
        this.entries.set(e.id, { requestHash: e.requestHash, state: e.state, expiresAt: e.expiresAt });
      }
    }
    if (file) mkdirSync(dirname(file), { recursive: true });
  }

  reserve(id: string, requestHash: string, expiresAt: number): ReserveResult {
    const e = this.entries.get(id);
    if (e) return e.requestHash === requestHash ? 'duplicate' : 'conflict';
    this.set(id, { requestHash, state: 'reserved', expiresAt });
    return 'reserved';
  }

  finish(id: string, state: 'done' | 'failed'): void {
    const e = this.entries.get(id);
    if (e) this.set(id, { ...e, state });
  }

  private set(id: string, e: Entry) {
    this.entries.set(id, e);
    if (this.file) appendFileSync(this.file, JSON.stringify({ id, ...e }) + '\n');
  }
}
