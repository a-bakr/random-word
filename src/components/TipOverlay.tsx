'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { Tip } from '../lib/tips';
import { useLanguage } from '../contexts/LanguageContext';

function WavyLine() {
  return (
    <svg
      viewBox="0 0 300 10"
      className="w-full max-w-xs mt-3 mb-8 text-zinc-300 dark:text-zinc-700"
      preserveAspectRatio="none"
    >
      <path
        d="M0,5 Q18,0 36,5 Q54,10 72,5 Q90,0 108,5 Q126,10 144,5 Q162,0 180,5 Q198,10 216,5 Q234,0 252,5 Q270,10 288,5 Q294,3 300,5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TipOverlay({
  tip,
  onClose,
  onTryNow,
}: {
  tip: Tip | null;
  onClose: () => void;
  onTryNow: () => void;
}) {
  const { lang } = useLanguage();
  const t = lang.labels.tips;

  const categoryLabel: Record<string, string> = {
    vocal:     t.vocal,
    framework: t.framework,
    archetype: t.archetype,
  };

  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          initial={{ opacity: 0, filter: 'blur(8px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          exit={{ opacity: 0, filter: 'blur(12px)' }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0 z-40 flex flex-col justify-center px-12 select-none"
        >
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.4 }}
            className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 mb-5"
          >
            {categoryLabel[tip.category]}
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-[clamp(48px,10vw,88px)] leading-none font-medium tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            {tip.title}
          </motion.h2>

          <motion.div
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            style={{ originX: 0 }}
          >
            <WavyLine />
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-2xl text-zinc-500 dark:text-zinc-400 leading-snug max-w-md mb-4"
          >
            {tip.description}
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-lg text-zinc-400 dark:text-zinc-600 italic leading-relaxed max-w-sm"
          >
            {tip.instruction}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.4 }}
            className="mt-16 flex items-center gap-6"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="text-sm text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors"
            >
              {t.tapToDismiss}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); onTryNow(); }}
              className="text-sm font-medium text-zinc-900 dark:text-zinc-50 underline decoration-dotted underline-offset-4 hover:opacity-70 transition-opacity"
            >
              {t.tryNow}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
