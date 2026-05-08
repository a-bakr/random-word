'use client';

import { useState, useCallback } from 'react';

export function useLocalStorage(key: string, defaultValue: number): [number, (v: number) => void] {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? Number(stored) : defaultValue;
  });

  const set = useCallback(
    (v: number) => {
      setValue(v);
      localStorage.setItem(key, String(v));
    },
    [key],
  );

  return [value, set];
}

export function useLocalStorageStr(key: string, defaultValue: string): [string, (v: string) => void] {
  const [value, setValue] = useState(() => {
    if (typeof window === 'undefined') return defaultValue;
    const stored = localStorage.getItem(key);
    return stored ?? defaultValue;
  });

  const set = useCallback(
    (v: string) => {
      setValue(v);
      localStorage.setItem(key, v);
    },
    [key],
  );

  return [value, set];
}

export function useLocalStorageBool(key: string, defaultValue: boolean): [boolean, (v: boolean) => void] {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? stored !== 'false' : defaultValue;
  });

  const set = useCallback(
    (v: boolean) => {
      setValue(v);
      localStorage.setItem(key, String(v));
    },
    [key],
  );

  return [value, set];
}
