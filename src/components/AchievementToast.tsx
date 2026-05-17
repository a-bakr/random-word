'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Achievement } from '../lib/achievements';

export function AchievementToast({
  achievements,
  onDismiss,
}: {
  achievements: Achievement[];
  onDismiss: (id: string) => void;
}) {
  const current = achievements[0] ?? null;

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => onDismiss(current.id), 3000);
    return () => clearTimeout(t);
  }, [current, onDismiss]);

  return (
    <AnimatePresence>
      {current && (
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] pointer-events-none"
        >
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-50 shadow-lg">
            <span className="text-xs text-zinc-400 dark:text-zinc-500">✦</span>
            <span className="text-xs font-medium tracking-wide text-zinc-50 dark:text-zinc-900 whitespace-nowrap">
              {current.title}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
