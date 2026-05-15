'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

export function AboutOverlay({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="absolute inset-0 z-50 bg-zinc-50 dark:bg-zinc-950 flex flex-col"
          onClick={(e) => { e.stopPropagation(); onClose(); }}
        >
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col px-8 pt-14 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <div className="mb-8">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                <img
                  src="/creator.png"
                  alt="Abdallah Bakr"
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            </div>

            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 mb-2">
              created by
            </p>
            <h2 className="text-[clamp(36px,8vw,64px)] leading-none font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
              Abdallah Bakr
            </h2>
            <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-1">AI Engineer · Cairo, Egypt</p>

            <svg viewBox="0 0 200 8" className="w-48 mt-3 mb-8 text-zinc-300 dark:text-zinc-700">
              <path
                d="M0,4 Q25,0 50,4 Q75,8 100,4 Q125,0 150,4 Q175,8 200,4"
                fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
              />
            </svg>

            <p className="text-2xl text-zinc-500 dark:text-zinc-400 leading-snug max-w-sm mb-6">
              Random Word
            </p>
            <p className="text-lg text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-sm mb-4 italic">
              Practice how you speak, one word at a time.
            </p>
            <p className="text-base text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-sm mb-6">
              Coaching tips inspired by Vinh Giang's STAGE Academy — vocal foundations, storytelling frameworks, and speaking archetypes woven into your daily practice.
            </p>
            <p className="text-sm text-zinc-400 dark:text-zinc-600 leading-relaxed max-w-sm">
              Architect turned AI Engineer. Currently building AIDA — an enterprise multi-agent platform serving 10,000+ engineers at one of the world's largest consultancies.
            </p>
            <div className="flex gap-4 mt-6">
              <a
                href="https://bakrai.com"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200 underline underline-offset-2"
              >
                bakrai.com
              </a>
              <a
                href="https://linkedin.com/in/abdallah-bakr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200 underline underline-offset-2"
              >
                linkedin
              </a>
              <a
                href="https://github.com/a-bakr"
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200 underline underline-offset-2"
              >
                github
              </a>
            </div>
          </motion.div>

          <p className="absolute bottom-6 inset-x-0 text-center text-xs text-zinc-300 dark:text-zinc-700 pointer-events-none">
            tap anywhere to close
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
