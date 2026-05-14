'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Type, Mic2, SlidersHorizontal, Info, MoreHorizontal } from 'lucide-react';

const ITEMS = [
  { id: 'twisters', label: 'Twisters', Icon: Mic2 },
  { id: 'settings', label: 'Settings', Icon: SlidersHorizontal },
  { id: 'about',    label: 'About',    Icon: Info },
  { id: 'words',    label: 'Words',    Icon: Type },
];

export function MenuButton({
  open,
  onToggle,
  onSelect,
  mode,
}: {
  open: boolean;
  onToggle: () => void;
  onSelect: (id: string) => void;
  mode: 'words' | 'twisters';
}) {
  return (
    <div
      className="absolute bottom-6 left-6 z-20"
      onClick={e => e.stopPropagation()}
    >
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-14 left-0 flex flex-col gap-0.5
              bg-zinc-50 dark:bg-zinc-950
              border border-zinc-200 dark:border-zinc-800
              rounded-2xl p-1.5 min-w-[152px]"
          >
            {ITEMS.map(({ id, label, Icon }) => {
              const active =
                (id === 'words' && mode === 'words') ||
                (id === 'twisters' && mode === 'twisters');
              return (
                <button
                  key={id}
                  onClick={() => onSelect(id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-left w-full transition-colors duration-150
                    ${active
                      ? 'bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50'
                    }`}
                >
                  <Icon size={15} strokeWidth={1.5} />
                  {label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        onClick={onToggle}
        whileTap={{ scale: 0.9 }}
        className={`p-3 rounded-full transition-colors duration-300 ${
          open
            ? 'text-zinc-900 dark:text-zinc-50'
            : 'text-zinc-400/50 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50'
        }`}
        aria-label="Menu"
      >
        <MoreHorizontal size={20} strokeWidth={1.5} />
      </motion.button>
    </div>
  );
}
