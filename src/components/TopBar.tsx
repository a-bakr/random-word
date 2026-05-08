'use client';

import { Volume2, VolumeX, Moon, Sun } from 'lucide-react';
import { ModeSwitch } from './ModeSwitch';

export function TopBar({
  isSoundEnabled,
  onSoundToggle,
  isDark,
  onThemeToggle,
  mode,
  onModeToggle,
}: {
  isSoundEnabled: boolean;
  onSoundToggle: (e: React.MouseEvent) => void;
  isDark: boolean;
  onThemeToggle: (e: React.MouseEvent) => void;
  mode: 'words' | 'twisters';
  onModeToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <div className="absolute top-6 inset-x-6 z-10 flex items-center justify-between pointer-events-none">
      <div className="pointer-events-auto">
        <ModeSwitch mode={mode} onToggle={onModeToggle} />
      </div>
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
    </div>
  );
}
