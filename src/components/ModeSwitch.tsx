'use client';

import { Type, Quote } from 'lucide-react';

export function ModeSwitch({
  mode,
  onToggle,
}: {
  mode: 'words' | 'twisters';
  onToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="flex items-center gap-2 rounded-full px-4 py-2 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80 transition-all duration-300 text-sm font-medium pointer-events-auto"
      aria-label={`Switch to ${mode === 'words' ? 'tongue twisters' : 'random words'}`}
      title={`Switch to ${mode === 'words' ? 'tongue twisters' : 'random words'}`}
    >
      {mode === 'words' ? <Type size={16} strokeWidth={1.75} /> : <Quote size={16} strokeWidth={1.75} />}
      <span>{mode === 'words' ? 'words' : 'twisters'}</span>
    </button>
  );
}
