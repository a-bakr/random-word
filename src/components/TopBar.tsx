'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Moon, Sun, MoreHorizontal, Mic2, SlidersHorizontal, Info, Type } from 'lucide-react';

const FONT_SIZES = [24, 36, 50, 72, 100, 140];

const fontSizeClass: Record<number, string> = {
  24: 'text-sm', 36: 'text-base', 50: 'text-lg',
  72: 'text-xl', 100: 'text-2xl', 140: 'text-3xl',
};

function nextIn(value: number, options: number[]) {
  return options[(options.indexOf(value) + 1) % options.length] ?? options[0];
}

const MENU_ITEMS = [
  { id: 'twisters', label: 'Twisters', Icon: Mic2 },
  { id: 'settings', label: 'Settings', Icon: SlidersHorizontal },
  { id: 'about',    label: 'About',    Icon: Info },
  { id: 'words',    label: 'Words',    Icon: Type },
];

export function TopBar({
  isDark,
  onThemeToggle,
  fontSize,
  onFontSizeChange,
  menuOpen,
  onMenuToggle,
  onMenuSelect,
  mode,
}: {
  isDark: boolean;
  onThemeToggle: (e: React.MouseEvent) => void;
  fontSize: number;
  onFontSizeChange: (n: number) => void;
  menuOpen: boolean;
  onMenuToggle: () => void;
  onMenuSelect: (id: string) => void;
  mode: 'words' | 'twisters';
}) {
  const cycleFont = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFontSizeChange(nextIn(fontSize, FONT_SIZES));
  };

  return (
    <div className="absolute top-6 inset-x-6 z-20 flex items-center justify-between pointer-events-none">
      {/* Left: theme */}
      <div className="flex items-center pointer-events-auto">
        <button
          onClick={onThemeToggle}
          className="rounded-full p-3 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-500"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Right: font size + menu */}
      <div
        className="flex items-center gap-1 pointer-events-auto"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={cycleFont}
          title="Font size"
          aria-label="Cycle font size"
          className="rounded-full px-3 py-2 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300"
        >
          <span className={`font-semibold leading-none ${fontSizeClass[fontSize] ?? 'text-base'}`}>A</span>
        </button>

        <div className="relative">
          <motion.button
            onClick={e => { e.stopPropagation(); onMenuToggle(); }}
            whileTap={{ scale: 0.9 }}
            className={`p-3 rounded-full transition-colors duration-300 ${
              menuOpen
                ? 'text-zinc-900 dark:text-zinc-50'
                : 'text-zinc-400/50 dark:text-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-50'
            }`}
            aria-label="Menu"
          >
            <MoreHorizontal size={20} strokeWidth={1.5} />
          </motion.button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-full right-0 mt-1 flex flex-col gap-0.5
                  bg-zinc-50 dark:bg-zinc-950
                  border border-zinc-200 dark:border-zinc-800
                  rounded-2xl p-1.5 min-w-[152px]"
              >
                {MENU_ITEMS.map(({ id, label, Icon }) => {
                  const active =
                    (id === 'words' && mode === 'words') ||
                    (id === 'twisters' && mode === 'twisters');
                  return (
                    <button
                      key={id}
                      onClick={e => { e.stopPropagation(); onMenuSelect(id); }}
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
        </div>
      </div>
    </div>
  );
}
