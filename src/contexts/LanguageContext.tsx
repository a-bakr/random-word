'use client';

// Side-effect imports register each language into the registry.
// To add a new language: create src/lib/languages/xx.ts and import it here.
import '../lib/languages/en';
import '../lib/languages/ar';

import { createContext, useCallback, useContext } from 'react';
import type { LanguageConfig, LanguageCode } from '../lib/languages/registry';
import { getLanguage } from '../lib/languages/registry';
import { useLocalStorageStr } from '../hooks/useLocalStorage';

interface LanguageContextValue {
  lang: LanguageConfig;
  setLanguageCode: (code: LanguageCode) => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [code, setCode] = useLocalStorageStr('language', 'en');
  const lang = getLanguage(code);

  const setLanguageCode = useCallback(
    (next: LanguageCode) => setCode(next),
    [setCode],
  );

  return (
    <LanguageContext.Provider value={{ lang, setLanguageCode }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be inside LanguageProvider');
  return ctx;
}
