'use client';

import { Type, Zap, Flame, SlidersHorizontal, Info } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'words',    Icon: Type,              label: 'Words'    },
  { id: 'twisters', Icon: Zap,               label: 'Twisters' },
  { id: 'warmup',   Icon: Flame,             label: 'Warm-up'  },
  { id: 'settings', Icon: SlidersHorizontal, label: 'Settings' },
  { id: 'about',    Icon: Info,              label: 'About'    },
];

export function TopBar({
  mode,
  onMenuSelect,
}: {
  mode: 'words' | 'twisters' | 'warmup';
  onMenuSelect: (id: string) => void;
}) {
  return (
    <div
      className="absolute top-6 inset-x-0 z-20 flex justify-center pointer-events-none"
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
    </div>
  );
}
