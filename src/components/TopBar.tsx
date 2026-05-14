'use client';

import { Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { CyclingPill } from './CyclingPill';

const FONT_SIZES = [24, 36, 50, 72, 100, 140];
const MAX_WORDS  = [1, 2, 3, 5, 10];

function nextIn(value: number, options: number[]) {
  return options[(options.indexOf(value) + 1) % options.length] ?? options[0];
}

function WordCountButton({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const next = () => onChange(nextIn(value, MAX_WORDS));
  return (
    <button
      onClick={e => { e.stopPropagation(); next(); }}
      title="Words on screen"
      className="flex items-center gap-[3px] rounded-full p-3 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300"
      aria-label="Words on screen"
    >
      {value <= 5
        ? Array.from({ length: value }).map((_, i) => (
            <span key={i} className="inline-block w-[5px] h-[5px] rounded-sm bg-current" />
          ))
        : <span className="text-base font-medium leading-none">∞</span>}
    </button>
  );
}

export function TopBar({
  isSoundEnabled,
  onSoundToggle,
  isDark,
  onThemeToggle,
  fontSize,
  onFontSizeChange,
  maxWords,
  onMaxWordsChange,
  mode,
}: {
  isSoundEnabled: boolean;
  onSoundToggle: (e: React.MouseEvent) => void;
  isDark: boolean;
  onThemeToggle: (e: React.MouseEvent) => void;
  fontSize: number;
  onFontSizeChange: (n: number) => void;
  maxWords: number;
  onMaxWordsChange: (n: number) => void;
  mode: 'words' | 'twisters';
}) {
  return (
    <div className="absolute top-6 inset-x-6 z-10 flex items-center justify-between pointer-events-none">
      {/* Left: sound + theme */}
      <div className="flex items-center pointer-events-auto">
        <button
          onClick={onSoundToggle}
          className="rounded-full p-3 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-500"
          aria-label={isSoundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {isSoundEnabled ? <Volume2 size={20} strokeWidth={1.5} /> : <VolumeX size={20} strokeWidth={1.5} />}
        </button>
        <button
          onClick={onThemeToggle}
          className="rounded-full p-3 text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-500"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Right: font size + word count */}
      <div className="flex items-center pointer-events-auto">
        <CyclingPill
          value={fontSize}
          options={FONT_SIZES}
          onChange={onFontSizeChange}
          label="Aa"
          title="Font size"
        />
        {mode === 'words' && (
          <WordCountButton value={maxWords} onChange={onMaxWordsChange} />
        )}
      </div>
    </div>
  );
}
