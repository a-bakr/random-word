'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const MAX_WORDS  = [1, 2, 3, 5, 10];
const TIP_COUNTS = [0, 1, 2, 3];

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-900">
      <span className="text-base text-zinc-600 dark:text-zinc-400">{label}</span>
      {children}
    </div>
  );
}

export function SettingsOverlay({
  visible,
  onClose,
  isDark,
  onThemeToggle,
  isSoundEnabled,
  onSoundToggle,
  centeredWord,
  onCenteredWordToggle,
  maxWords,
  onMaxWordsChange,
  tipCount,
  onTipCountChange,
  isAdmin,
}: {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  isSoundEnabled: boolean;
  onSoundToggle: () => void;
  centeredWord: boolean;
  onCenteredWordToggle: () => void;
  maxWords: number;
  onMaxWordsChange: (n: number) => void;
  tipCount: number;
  onTipCountChange: (n: number) => void;
  isAdmin: boolean;
}) {
  const { lang } = useLanguage();
  const s = lang.labels.settings;

  const cycleMaxWords = () => {
    const idx = MAX_WORDS.indexOf(maxWords);
    onMaxWordsChange(MAX_WORDS[(idx + 1) % MAX_WORDS.length]);
  };

  const cycleTipCount = () => {
    const idx = TIP_COUNTS.indexOf(tipCount);
    onTipCountChange(TIP_COUNTS[(idx + 1) % TIP_COUNTS.length]);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          dir={lang.direction}
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
            className="flex flex-col px-8 pt-14 pb-10 max-w-lg mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className={`absolute top-6 ${lang.direction === 'rtl' ? 'left-6' : 'right-6'} p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors`}
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 mb-2">
              {s.preferences}
            </p>
            <h2 className="text-[clamp(36px,8vw,64px)] leading-none font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-10">
              {s.title}
            </h2>

            <Row label={s.theme}>
              <button
                onClick={(e) => { e.stopPropagation(); onThemeToggle(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                {isDark ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
                <span className="text-sm">{isDark ? s.themeDark : s.themeLight}</span>
              </button>
            </Row>

            <Row label={s.sound}>
              <button
                onClick={(e) => { e.stopPropagation(); onSoundToggle(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                {isSoundEnabled
                  ? <Volume2 size={16} strokeWidth={1.5} />
                  : <VolumeX size={16} strokeWidth={1.5} />}
                <span className="text-sm">{isSoundEnabled ? s.soundOn : s.soundOff}</span>
              </button>
            </Row>

            <Row label={s.wordsOnScreen}>
              <button
                onClick={(e) => { e.stopPropagation(); cycleMaxWords(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="text-sm font-medium">{maxWords === 10 ? '∞' : maxWords}</span>
                <span className="text-xs text-zinc-400">{s.tapToCycle}</span>
              </button>
            </Row>

            <Row label={s.wordDisplay}>
              <button
                onClick={(e) => { e.stopPropagation(); onCenteredWordToggle(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="text-sm">{centeredWord ? s.wordCentered : s.wordRandom}</span>
              </button>
            </Row>

            <Row label={s.coachingTips}>
              <button
                onClick={(e) => { e.stopPropagation(); cycleTipCount(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="text-sm font-medium">{tipCount === 0 ? s.off : tipCount}</span>
                <span className="text-xs text-zinc-400">{s.tapToCycle}</span>
              </button>
            </Row>

            {isAdmin && (
              <Row label={s.admin}>
                <a
                  href="/admin"
                  onClick={e => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                    text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  <LayoutDashboard size={16} strokeWidth={1.5} />
                  <span className="text-sm">{s.dashboard}</span>
                </a>
              </Row>
            )}

          </motion.div>

          <p className="absolute bottom-6 inset-x-0 text-center text-xs text-zinc-300 dark:text-zinc-700 pointer-events-none">
            {s.tapToClose}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
