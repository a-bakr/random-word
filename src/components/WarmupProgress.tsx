'use client';

import { RotateCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

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
  const { lang } = useLanguage();
  const w = lang.labels.warmup;
  const n = index + 1;

  function progressLabel(): string {
    if (n === Math.ceil(total / 2)) return `${n} ${w.of} ${total} · ${w.halfway}`;
    if (n === total)                 return `${n} ${w.of} ${total} · ${w.finalStretch}`;
    if (n === 1 && index !== 0)      return `${n} ${w.of} ${total} · ${w.goingAgain}`;
    return `${n} ${w.of} ${total}`;
  }

  const label = isFirstVisit && index === 0 ? `${n} ${w.of} ${total}` : progressLabel();
  const percent = total > 0 ? (n / total) * 100 : 0;

  return (
    <div
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-auto"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-mono text-zinc-400 dark:text-zinc-500 tabular-nums">
          {label}
        </span>
        <button
          onClick={onReset}
          className="text-zinc-300 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors duration-300"
          style={{ filter: 'url(#sketch)' }}
          aria-label="Reset warm-up"
          title={w.resetExercise}
        >
          <RotateCcw size={14} strokeWidth={2.5} />
        </button>
      </div>
      <div className="w-40 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-zinc-400 dark:bg-zinc-500"
          initial={false}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>
    </div>
  );
}
