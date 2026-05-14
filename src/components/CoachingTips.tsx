'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { Tip } from '../lib/tips';

const categoryColors: Record<string, string> = {
  vocal:      'text-blue-500 dark:text-blue-400',
  framework:  'text-amber-500 dark:text-amber-400',
  archetype:  'text-emerald-500 dark:text-emerald-400',
};

const categoryBorders: Record<string, string> = {
  vocal:      'border-blue-400/70 dark:border-blue-500/60',
  framework:  'border-amber-400/70 dark:border-amber-500/60',
  archetype:  'border-emerald-400/70 dark:border-emerald-500/60',
};

// Positions relative to word center (dx, dy in px), slight sketch rotation
const TIP_OFFSETS = [
  { dx: -105, dy: -78, rot: -2 },
  { dx:  108, dy: -68, rot:  1.5 },
  { dx:    4, dy:  88, rot: -1 },
];

export function CoachingTips({
  tips,
  onTipClick,
  visible,
  wordX,
  wordY,
}: {
  tips: [Tip, Tip, Tip];
  onTipClick: (tip: Tip) => void;
  visible: boolean;
  wordX: number;
  wordY: number;
}) {
  return (
    <AnimatePresence>
      {visible && tips.map((tip, i) => {
        const { dx, dy, rot } = TIP_OFFSETS[i];
        return (
          <motion.button
            key={`${tip.category}-${tip.label}`}
            className={`absolute z-10 px-3 py-1.5 text-[11px] font-semibold tracking-widest
              bg-zinc-50/90 dark:bg-zinc-900/90
              border-2 border-dashed rounded-sm
              ${categoryBorders[tip.category]}
              ${categoryColors[tip.category]}`}
            style={{ left: wordX + dx, top: wordY + dy }}
            initial={{ opacity: 0, x: '-50%', y: '-50%', scale: 0.7, rotate: 0 }}
            animate={{ opacity: 1, x: '-50%', y: '-50%', scale: 1, rotate: rot }}
            exit={{ opacity: 0, x: '-50%', y: '-50%', scale: 0.7, rotate: 0 }}
            transition={{ duration: 0.45, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => { e.stopPropagation(); onTipClick(tip); }}
            whileHover={{ scale: 1.07, x: '-50%', y: '-50%' }}
            whileTap={{ scale: 0.95, x: '-50%', y: '-50%' }}
          >
            {tip.label}
          </motion.button>
        );
      })}
    </AnimatePresence>
  );
}
