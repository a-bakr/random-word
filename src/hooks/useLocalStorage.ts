'use client';

import { useState, useCallback } from 'react';

function read<T>(key: string, defaultValue: T, parse: (s: string) => T): T {
  if (typeof window === 'undefined') return defaultValue;
  const stored = localStorage.getItem(key);
  return stored !== null ? parse(stored) : defaultValue;
}

function identity(s: string): string { return s; }
function parseBoolean(s: string): boolean { return s !== 'false'; }

function useStorage<T>(key: string, defaultValue: T, parse: (s: string) => T, serialize: (v: T) => string): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => read(key, defaultValue, parse));
  const set = useCallback((v: T) => {
    setValue(v);
    localStorage.setItem(key, serialize(v));
  }, [key, serialize]);
  return [value, set];
}

export function useLocalStorage(key: string, defaultValue: number): [number, (v: number) => void] {
  return useStorage(key, defaultValue, Number, String);
}

export function useLocalStorageStr(key: string, defaultValue: string): [string, (v: string) => void] {
  return useStorage(key, defaultValue, identity, identity);
}

export function useLocalStorageBool(key: string, defaultValue: boolean): [boolean, (v: boolean) => void] {
  return useStorage(key, defaultValue, parseBoolean, String);
}
