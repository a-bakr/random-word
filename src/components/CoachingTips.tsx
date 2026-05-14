'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { Tip } from '../lib/tips';

const categoryColors: Record<string, string> = {
  vocal: 'text-blue-500 dark:text-blue-400',
  framework: 'text-amber-500 dark:text-amber-400',
  archetype: 'text-emerald-500 dark:text-emerald-400',
};

export function CoachingTips({
  tips,
  onTipClick,
  visible,
}: {
  tips: [Tip, Tip, Tip];
  onTipClick: (tip: Tip) => void;
  visible: boolean;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -6 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-[92px] left-6 flex flex-col gap-2 z-10 pointer-events-none"
        >
          {tips.map((tip, i) => (
            <motion.button
              key={`${tip.category}-${tip.label}`}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: i * 0.07, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => { e.stopPropagation(); onTipClick(tip); }}
              className={`pointer-events-auto w-fit px-3 py-1.5 rounded-full text-[11px] font-semibold tracking-widest
                bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur
                border border-zinc-200/60 dark:border-zinc-800/60
                hover:border-zinc-300 dark:hover:border-zinc-700
                transition-all duration-300 ${categoryColors[tip.category]}`}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
            >
              {tip.label}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
