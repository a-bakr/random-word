'use client';

import { useEffect, useRef } from 'react';
import { motion, useAnimation } from 'motion/react';
import { TOTAL_ACHIEVEMENTS } from '../lib/achievements';

export function AchievementBadge({
  earned,
  onClick,
}: {
  earned: string[];
  onClick: () => void;
}) {
  const controls = useAnimation();
  const prevCountRef = useRef(earned.length);

  useEffect(() => {
    if (earned.length > prevCountRef.current) {
      prevCountRef.current = earned.length;
      controls.start({ scale: [1, 1.35, 1], transition: { duration: 0.4, ease: 'easeOut' } });
    }
  }, [earned.length, controls]);

  return (
    <motion.button
      animate={controls}
      onClick={e => { e.stopPropagation(); onClick(); }}
      className="flex items-center gap-1.5 px-3 py-2 rounded-full
        text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-400
        transition-colors duration-200 select-none"
      aria-label="View achievements"
    >
      <span className="text-[10px]">✦</span>
      <span className="text-[11px] font-medium tabular-nums tracking-wide">
        {earned.length}/{TOTAL_ACHIEVEMENTS}
      </span>
    </motion.button>
  );
}
