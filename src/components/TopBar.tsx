'use client';

import { Type, Zap, SlidersHorizontal, Info } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'words',    Icon: Type,              label: 'Words'    },
  { id: 'twisters', Icon: Zap,               label: 'Twisters' },
  { id: 'settings', Icon: SlidersHorizontal, label: 'Settings' },
  { id: 'about',    Icon: Info,              label: 'About'    },
];

export function TopBar({
  mode,
  onMenuSelect,
}: {
  mode: 'words' | 'twisters';
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
            (id === 'twisters' && mode === 'twisters');
          return (
            <button
              key={id}
              onClick={e => { e.stopPropagation(); onMenuSelect(id); }}
              aria-label={label}
              className={`rounded-full p-3 transition-colors duration-300 ${
                active
                  ? 'text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-400/40 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            >
              <Icon size={20} strokeWidth={1.5} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
