'use client';

import { useLocalStorage } from './useLocalStorage';
import { WARMUP_EXERCISES } from '../lib/warmup';

export function useWarmup() {
  const total = WARMUP_EXERCISES.length;
  const [index, setIndex] = useLocalStorage('warmupIndex', 0);
  const safeIndex = Math.min(Math.max(0, index), total - 1);
  const exercise = WARMUP_EXERCISES[safeIndex];

  const advance = () => setIndex((safeIndex + 1) % total);
  const reset = () => setIndex(0);

  return { exercise, index: safeIndex, total, advance, reset };
}
