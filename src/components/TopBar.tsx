'use client';

import { Moon, Sun } from 'lucide-react';

const FONT_SIZES = [24, 36, 50, 72, 100, 140];

const fontSizeClass: Record<number, string> = {
  24: 'text-sm', 36: 'text-base', 50: 'text-lg',
  72: 'text-xl', 100: 'text-2xl', 140: 'text-3xl',
};

function nextIn(value: number, options: number[]) {
  return options[(options.indexOf(value) + 1) % options.length] ?? options[0];
}

export function TopBar({
  isDark,
  onThemeToggle,
  fontSize,
  onFontSizeChange,
}: {
  isDark: boolean;
  onThemeToggle: (e: React.MouseEvent) => void;
  fontSize: number;
  onFontSizeChange: (n: number) => void;
}) {
  const cycleFont = (e: React.MouseEvent) => {
    e.stopPropagation();
    onFontSizeChange(nextIn(fontSize, FONT_SIZES));
  };

  return (
    <div className="absolute top-6 inset-x-6 z-10 flex items-center justify-between pointer-events-none">
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

      {/* Right: font size */}
      <div className="flex items-center pointer-events-auto">
        <button
          onClick={cycleFont}
          title="Font size"
          aria-label="Cycle font size"
          className="rounded-full px-3 py-2 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300"
        >
          <span className={`font-semibold leading-none ${fontSizeClass[fontSize] ?? 'text-base'}`}>A</span>
        </button>
      </div>
    </div>
  );
}
