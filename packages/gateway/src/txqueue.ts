/** Runs async jobs one at a time, so transactions from one account never race on the nonce. */
export class SerialQueue {
  private tail: Promise<unknown> = Promise.resolve();
  run<T>(job: () => Promise<T>): Promise<T> {
    const p = this.tail.then(job, job);
    this.tail = p.catch(() => undefined);
    return p;
  }
}
