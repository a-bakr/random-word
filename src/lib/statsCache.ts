'use client';

/**
 * Tiny stale-while-revalidate cache backed by localStorage. Lets data-heavy
 * screens (practice stats, admin dashboard) paint instantly from the last
 * known value, then refresh in the background — instead of blank → spinner →
 * data on every open.
 */

type Entry<T> = { t: number; v: T };

/** Read a cached value. Returns it regardless of age (stale-while-revalidate);
 *  pass `maxAgeMs` to drop entries older than that. */
export function readCache<T>(key: string, maxAgeMs?: number): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const entry = JSON.parse(raw) as Entry<T>;
    if (typeof entry?.t !== 'number') return null;
    if (maxAgeMs != null && Date.now() - entry.t > maxAgeMs) return null;
    return entry.v;
  } catch {
    return null;
  }
}

/** Persist a value with the current timestamp. Never throws (quota/SSR safe). */
export function writeCache<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify({ t: Date.now(), v: value } as Entry<T>));
  } catch {
    /* quota or unavailable — caching is best-effort */
  }
}
