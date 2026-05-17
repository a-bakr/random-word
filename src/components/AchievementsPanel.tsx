'use client';

import { motion } from 'motion/react';
import { ACHIEVEMENTS } from '../lib/achievements';

export function AchievementsPanel({
  earned,
  onClose,
}: {
  earned: string[];
  onClose: () => void;
}) {
  return (
    <>
      <motion.div
        className="fixed inset-0 z-[45]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      <motion.div
        className="fixed inset-x-0 bottom-0 z-[50] rounded-t-2xl
          bg-zinc-50/98 dark:bg-zinc-900/98 backdrop-blur-xl
          px-5 pt-5 pb-10 max-h-[70vh] overflow-y-auto"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 tracking-wide">
              Achievements
            </h2>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              {earned.length} of {ACHIEVEMENTS.length} earned
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-xs text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
          >
            close
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2">
          {ACHIEVEMENTS.map(a => {
            const isEarned = earned.includes(a.id);
            return (
              <div
                key={a.id}
                className={`flex flex-col items-center gap-1.5 rounded-xl p-3 text-center
                  ${isEarned
                    ? 'bg-zinc-100 dark:bg-zinc-800'
                    : 'bg-zinc-100/50 dark:bg-zinc-800/30 opacity-40'
                  }`}
              >
                <span className={`text-lg ${isEarned ? 'text-zinc-700 dark:text-zinc-200' : 'text-zinc-400 dark:text-zinc-600'}`}>
                  {isEarned ? a.icon : '○'}
                </span>
                <span className="text-[9px] font-medium leading-tight text-zinc-600 dark:text-zinc-400 tracking-wide">
                  {a.title}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}
