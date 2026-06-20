'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import {
  FREE_LIMITS,
  resolveTier,
  todayKey,
  trialDaysLeft as calcTrialDaysLeft,
  type Quota,
  type Tier,
} from '@/lib/billing';

const STORAGE_KEY = 'freeUsage';

type UsageState = { date: string; words: number; twisters: number; warmups: number };

function loadUsage(): UsageState {
  const today = todayKey();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as UsageState;
      if (parsed && parsed.date === today) return parsed;
    }
  } catch {}
  return { date: today, words: 0, twisters: 0, warmups: 0 };
}

function saveUsage(u: UsageState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
  } catch {}
}

/**
 * Freemium entitlement: resolves the active tier and enforces the per-day free quota.
 *
 * `createdAt` is the Supabase user's signup date (trial anchor); `isPremium` comes from
 * the subscription layer (false until payments are wired). Daily counters live in
 * localStorage and reset at local midnight (a new day key starts fresh).
 */
export function useEntitlement(createdAt: string | undefined, isPremium = false) {
  const [usage, setUsage] = useState<UsageState>(() =>
    typeof window === 'undefined'
      ? { date: '', words: 0, twisters: 0, warmups: 0 }
      : loadUsage(),
  );
  const usageRef = useRef(usage);
  usageRef.current = usage;

  const tier = resolveTier(createdAt, isPremium);
  const trialDaysLeft = calcTrialDaysLeft(createdAt);

  /**
   * Attempt to consume one unit of `quota`. Returns true if allowed (and records it);
   * false if the free daily limit is reached. Trial/premium always pass without counting.
   */
  const tryConsume = useCallback(
    (quota: Quota): boolean => {
      if (tier !== 'free') return true;

      const today = todayKey();
      let current = usageRef.current;
      if (current.date !== today) current = { date: today, words: 0, twisters: 0, warmups: 0 };

      if (current[quota] >= FREE_LIMITS[quota]) {
        if (current !== usageRef.current) {
          usageRef.current = current;
          setUsage(current);
          saveUsage(current);
        }
        return false;
      }

      const next = { ...current, [quota]: current[quota] + 1 };
      usageRef.current = next;
      setUsage(next);
      saveUsage(next);
      return true;
    },
    [tier],
  );

  const remaining = useMemo(() => {
    const fresh = usage.date === todayKey() ? usage : { words: 0, twisters: 0, warmups: 0 };
    return {
      words: Math.max(0, FREE_LIMITS.words - fresh.words),
      twisters: Math.max(0, FREE_LIMITS.twisters - fresh.twisters),
      warmups: Math.max(0, FREE_LIMITS.warmups - fresh.warmups),
    };
  }, [usage]);

  return { tier, trialDaysLeft, tryConsume, remaining, isPremium };
}

export type { Tier, Quota };
