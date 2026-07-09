export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const getRandomColor = (isDark: boolean) =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, ${isDark ? 75 : 40}%)`;

/**
 * Races a promise against a timeout so a hung network call (e.g. an unreachable
 * Supabase / Postgres) can't block a request for the driver's full 10–30s
 * default. Rejects with a `TimeoutError` when the deadline passes; the underlying
 * promise keeps running but its result is ignored.
 */
export class TimeoutError extends Error {
  constructor(ms: number) {
    super(`timed out after ${ms}ms`);
    this.name = 'TimeoutError';
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new TimeoutError(ms)), ms);
    promise.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}
