'use client';

import { useState, useCallback, useRef } from 'react';
import { ACHIEVEMENTS, DEFAULT_COUNTERS, type AchievementCounters, type Achievement } from '../lib/achievements';

const COUNTERS_KEY = 'achievement_counters';
const EARNED_KEY = 'achievement_earned';

function loadCounters(): AchievementCounters {
  if (typeof window === 'undefined') return { ...DEFAULT_COUNTERS };
  try {
    const stored = localStorage.getItem(COUNTERS_KEY);
    if (stored) return { ...DEFAULT_COUNTERS, ...JSON.parse(stored) };
  } catch {}
  return { ...DEFAULT_COUNTERS };
}

function loadEarned(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(EARNED_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return [];
}

export function useAchievements() {
  const [counters, setCounters] = useState<AchievementCounters>(loadCounters);
  const [earned, setEarned] = useState<string[]>(loadEarned);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Achievement[]>([]);

  const earnedRef = useRef<string[]>(earned);
  earnedRef.current = earned;

  const checkAndUnlock = useCallback((updatedCounters: AchievementCounters, currentEarned: string[]) => {
    const newOnes = ACHIEVEMENTS.filter(
      a => !currentEarned.includes(a.id) && a.check(updatedCounters)
    );
    if (newOnes.length === 0) return;
    const newEarned = [...currentEarned, ...newOnes.map(a => a.id)];
    earnedRef.current = newEarned;
    setEarned(newEarned);
    setNewlyUnlocked(prev => [...prev, ...newOnes]);
    try { localStorage.setItem(EARNED_KEY, JSON.stringify(newEarned)); } catch {}
  }, []);

  const updateCounters = useCallback((updater: (c: AchievementCounters) => AchievementCounters) => {
    setCounters(prev => {
      const next = updater(prev);
      try { localStorage.setItem(COUNTERS_KEY, JSON.stringify(next)); } catch {}
      checkAndUnlock(next, earnedRef.current);
      return next;
    });
  }, [checkAndUnlock]);

  const increment = useCallback((key: keyof Omit<AchievementCounters, 'tipsViewed'>) => {
    updateCounters(c => ({ ...c, [key]: c[key] + 1 }));
  }, [updateCounters]);

  const addTipViewed = useCallback((label: string) => {
    updateCounters(c => {
      if (c.tipsViewed.includes(label)) return c;
      return { ...c, tipsViewed: [...c.tipsViewed, label] };
    });
  }, [updateCounters]);

  const dismissUnlocked = useCallback((id: string) => {
    setNewlyUnlocked(prev => prev.filter(a => a.id !== id));
  }, []);

  return { counters, earned, newlyUnlocked, increment, addTipViewed, dismissUnlocked };
}
