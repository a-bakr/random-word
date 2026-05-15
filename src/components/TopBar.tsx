'use client';

import { Type, Zap, Flame, SlidersHorizontal, Info } from 'lucide-react';
import type { LanguageConfig, LanguageCode } from '../lib/languages/registry';
import { LanguageSwitcher } from './LanguageSwitcher';

export function TopBar({
  mode,
  onMenuSelect,
  lang,
  onLanguageSwitch,
}: {
  mode: 'words' | 'twisters' | 'warmup';
  onMenuSelect: (id: string) => void;
  lang: LanguageConfig;
  onLanguageSwitch: (code: LanguageCode) => void;
}) {
  const NAV_ITEMS = [
    { id: 'words',    Icon: Type,              label: lang.labels.words    },
    { id: 'twisters', Icon: Zap,               label: lang.labels.twisters },
    { id: 'warmup',   Icon: Flame,             label: lang.labels.warmup   },
    { id: 'settings', Icon: SlidersHorizontal, label: 'Settings'           },
    { id: 'about',    Icon: Info,              label: 'About'              },
  ];

  return (
    <div
      className="absolute top-6 inset-x-0 z-20 flex items-center justify-center pointer-events-none"
    >
      <div
        className="flex items-center gap-1 pointer-events-auto"
        onClick={e => e.stopPropagation()}
      >
        {NAV_ITEMS.map(({ id, Icon, label }) => {
          const active =
            (id === 'words'    && mode === 'words') ||
            (id === 'twisters' && mode === 'twisters') ||
            (id === 'warmup'   && mode === 'warmup');
          return (
            <button
              key={id}
              onClick={e => { e.stopPropagation(); onMenuSelect(id); }}
              aria-label={label}
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
      </div>
      <div
        className="absolute right-4 pointer-events-auto"
        onClick={e => e.stopPropagation()}
      >
        <LanguageSwitcher current={lang.code} onChange={onLanguageSwitch} />
      </div>
    </div>
  );
}
