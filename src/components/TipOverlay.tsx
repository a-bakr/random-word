'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import type { Tip } from '../lib/tips';

const categoryLabel: Record<string, string> = {
  vocal: 'Vocal Foundation',
  framework: 'Framework',
  archetype: 'Archetype',
};

const categoryAccent: Record<string, string> = {
  vocal: 'text-blue-500 dark:text-blue-400',
  framework: 'text-amber-500 dark:text-amber-400',
  archetype: 'text-emerald-500 dark:text-emerald-400',
};

export function TipOverlay({
  tip,
  onClose,
  onTryNow,
}: {
  tip: Tip | null;
  onClose: () => void;
  onTryNow: () => void;
}) {
  return (
    <AnimatePresence>
      {tip && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-50 bg-zinc-50 dark:bg-zinc-950"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col h-full px-8 pt-16 pb-10 max-w-lg mx-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <p className={`text-[11px] font-semibold tracking-widest uppercase mb-3 ${categoryAccent[tip.category]}`}>
              {categoryLabel[tip.category]}
            </p>

            <h2 className="text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-5">
              {tip.title}
            </h2>

            <p className="text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed mb-8">
              {tip.description}
            </p>

            <div className="rounded-2xl bg-zinc-100 dark:bg-zinc-900 px-6 py-5 mb-6">
              <p className="text-[10px] font-semibold tracking-widest uppercase text-zinc-400 dark:text-zinc-500 mb-2">
                Example
              </p>
              <p className="text-base text-zinc-700 dark:text-zinc-300 italic leading-relaxed">
                {tip.example}
              </p>
            </div>

            <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
              {tip.instruction}
            </p>

            <button
              onClick={() => { onClose(); onTryNow(); }}
              className="mt-auto w-full py-4 rounded-2xl bg-zinc-900 dark:bg-zinc-50
                text-zinc-50 dark:text-zinc-900 font-medium text-base
                hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            >
              Try it now
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
