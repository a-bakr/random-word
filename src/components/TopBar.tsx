'use client';

import { Volume2, VolumeX, Moon, Sun, Play, Square } from 'lucide-react';
import { NumInput } from './NumInput';
import { ModeSwitch } from './ModeSwitch';

export function TopBar({
  fontSize,
  onFontSizeChange,
  maxWords,
  onMaxWordsChange,
  isSoundEnabled,
  onSoundToggle,
  isDark,
  onThemeToggle,
  mode,
  onModeToggle,
  onReplay,
  isTwisterPlaying,
}: {
  fontSize: number;
  onFontSizeChange: (n: number) => void;
  maxWords: number;
  onMaxWordsChange: (n: number) => void;
  isSoundEnabled: boolean;
  onSoundToggle: (e: React.MouseEvent) => void;
  isDark: boolean;
  onThemeToggle: (e: React.MouseEvent) => void;
  mode: 'words' | 'twisters';
  onModeToggle: (e: React.MouseEvent) => void;
  onReplay: (e: React.MouseEvent) => void;
  isTwisterPlaying: boolean;
}) {
  return (
    <div className="absolute top-6 inset-x-6 z-10 flex items-center justify-between pointer-events-none">
      <div className="pointer-events-auto">
        <ModeSwitch mode={mode} onToggle={onModeToggle} />
      </div>
      <div className="flex items-center pointer-events-auto">
        <NumInput
          value={fontSize}
          min={12}
          max={200}
          title="Font size (px)"
          width="4rem"
          onCommit={onFontSizeChange}
        />
        {mode === 'words' && (
          <NumInput
            value={maxWords}
            min={1}
            max={10}
            title="Words on screen"
            width="2.5rem"
            onCommit={onMaxWordsChange}
          />
        )}
        {mode === 'twisters' && (
          <button
            onClick={onReplay}
            className={`rounded-full p-3 transition-all duration-500 ${isTwisterPlaying
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            aria-label={isTwisterPlaying ? 'Stop audio' : 'Replay audio'}
          >
            {isTwisterPlaying ? <Square size={20} strokeWidth={1.5} /> : <Play size={20} strokeWidth={1.5} />}
          </button>
        )}
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
    </div>
  );
}
