'use client';

import { RotateCcw } from 'lucide-react';

function progressLabel(index: number, total: number): string {
  const n = index + 1;
  if (n === Math.ceil(total / 2)) return `${n} of ${total} · halfway there!`;
  if (n === total) return `${n} of ${total} · final stretch!`;
  if (n === 1 && index !== 0) return `${n} of ${total} · going again!`;
  return `${n} of ${total}`;
}

export function WarmupProgress({
  index,
  total,
  onReset,
  isFirstVisit,
}: {
  index: number;
  total: number;
  onReset: (e: React.MouseEvent) => void;
  isFirstVisit: boolean;
}) {
  const label = isFirstVisit && index === 0 ? `1 of ${total}` : progressLabel(index, total);

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-3 pointer-events-auto"
      onClick={e => e.stopPropagation()}
    >
      <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
        {label}
      </span>
      <button
        onClick={onReset}
        className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-300"
        style={{ filter: 'url(#sketch)' }}
        aria-label="Reset warm-up"
        title="Reset to first exercise"
      >
        <RotateCcw size={14} strokeWidth={2.5} />
      </button>
    </div>
  );
}
