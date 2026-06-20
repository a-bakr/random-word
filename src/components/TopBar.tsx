'use client';

import { Type, Zap, Flame, SlidersHorizontal, Info, Languages } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { getAllLanguages } from '../lib/languages/registry';
import type { LanguageCode } from '../lib/languages/registry';

export type AppMode = 'words' | 'twisters' | 'warmup' | 'settings' | 'about';

const NAV_ITEMS = [
  { id: 'words',    Icon: Type              },
  { id: 'twisters', Icon: Zap               },
  { id: 'warmup',   Icon: Flame             },
  { id: 'settings', Icon: SlidersHorizontal },
  { id: 'about',    Icon: Info              },
];

export function TopBar({
  mode,
  onMenuSelect,
}: {
  mode: AppMode;
  onMenuSelect: (id: string) => void;
}) {
  const { lang, setLanguageCode } = useLanguage();
  const allLanguages = getAllLanguages();

  const cycleLanguage = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = allLanguages.findIndex(l => l.code === lang.code);
    const next = allLanguages[(idx + 1) % allLanguages.length];
    setLanguageCode(next.code as LanguageCode);
  };

  return (
    // dir="ltr" keeps icons in their fixed positions for every language
    <div
      dir="ltr"
      className="absolute top-6 inset-x-0 z-20 flex justify-center pointer-events-none"
    >
      <div
        data-onb="modes"
        className="flex items-center gap-1 pointer-events-auto"
        onClick={e => e.stopPropagation()}
      >
        {NAV_ITEMS.map(({ id, Icon }) => {
          const active = id === mode;
          return (
            <button
              key={id}
              onClick={e => { e.stopPropagation(); onMenuSelect(id); }}
              aria-label={id}
              style={{ filter: 'url(#sketch)' }}
              className={`rounded-full p-3 transition-all duration-300 ${
                active
                  ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-900/10 dark:bg-zinc-50/10'
                  : 'text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            >
              <Icon size={20} strokeWidth={2.5} />
            </button>
          );
        })}

        <button
          onClick={cycleLanguage}
          aria-label={`Switch language — ${lang.nativeName}`}
          title={lang.nativeName}
          style={{ filter: 'url(#sketch)' }}
          className="rounded-full p-3 transition-all duration-300 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50"
        >
          <Languages size={20} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
