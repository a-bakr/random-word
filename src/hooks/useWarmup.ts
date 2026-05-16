'use client';

import { useEffect } from 'react';
import { useLocalStorage, useLocalStorageStr } from './useLocalStorage';
import { WARMUP_EXERCISES } from '../lib/warmup';
import { useLanguage } from '../contexts/LanguageContext';
import { shuffle } from '../lib/utils';

export function useWarmup() {
  const { lang } = useLanguage();
  const exercises = lang.warmupExercises ?? WARMUP_EXERCISES;
  const total = exercises.length;
  const allIds = exercises.map(e => e.id);

  const [orderIndex, setOrderIndex] = useLocalStorage('warmupOrderIndex', 0);
  const [orderStr, setOrderStr] = useLocalStorageStr('warmupOrder', '');

  useEffect(() => {
    if (!orderStr) {
      setOrderStr(JSON.stringify(shuffle(allIds)));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const order: string[] = (() => {
    if (orderStr) {
      try {
        const parsed = JSON.parse(orderStr);
        const idSet = new Set(allIds);
        if (Array.isArray(parsed) && parsed.length === total && parsed.every((id: unknown) => typeof id === 'string' && idSet.has(id))) {
          return parsed as string[];
        }
      } catch {}
    }
    return allIds;
  })();

  const safeIndex = Math.min(Math.max(0, orderIndex), total - 1);
  const currentId = order[safeIndex];
  const exercise = exercises.find(e => e.id === currentId) ?? exercises[0];

  const advance = () => {
    const nextIndex = (safeIndex + 1) % total;
    if (nextIndex === 0) {
      setOrderStr(JSON.stringify(shuffle(allIds)));
    }
    setOrderIndex(nextIndex);
  };

  const goBack = () => {
    setOrderIndex((safeIndex - 1 + total) % total);
  };

  const reset = () => {
    setOrderStr(JSON.stringify(shuffle(allIds)));
    setOrderIndex(0);
  };

  return { exercise, index: safeIndex, total, advance, goBack, reset };
}
