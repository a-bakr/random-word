'use client';

import { motion, AnimatePresence } from 'motion/react';
import { X, Volume2, VolumeX, Moon, Sun, Clock } from 'lucide-react';

const FONT_SIZES = [24, 36, 50, 72, 100, 140];

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
  fontSize,
  onFontSizeChange,
  timerEnabled,
  onTimerToggle,
  centeredWord,
  onCenteredWordToggle,
}: {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  onThemeToggle: () => void;
  isSoundEnabled: boolean;
  onSoundToggle: () => void;
  fontSize: number;
  onFontSizeChange: (n: number) => void;
  timerEnabled: boolean;
  onTimerToggle: () => void;
  centeredWord: boolean;
  onCenteredWordToggle: () => void;
}) {
  const cycleFontSize = () => {
    const idx = FONT_SIZES.indexOf(fontSize);
    onFontSizeChange(FONT_SIZES[(idx + 1) % FONT_SIZES.length]);
  };

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
            className="flex flex-col px-8 pt-14 pb-10 max-w-lg mx-auto w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <X size={20} strokeWidth={1.5} />
            </button>

            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 mb-2">
              preferences
            </p>
            <h2 className="text-[clamp(36px,8vw,64px)] leading-none font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-10">
              Settings
            </h2>

            <Row label="Theme">
              <button
                onClick={(e) => { e.stopPropagation(); onThemeToggle(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                {isDark ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
                <span className="text-sm">{isDark ? 'Dark' : 'Light'}</span>
              </button>
            </Row>

            <Row label="Sound effects">
              <button
                onClick={(e) => { e.stopPropagation(); onSoundToggle(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                {isSoundEnabled
                  ? <Volume2 size={16} strokeWidth={1.5} />
                  : <VolumeX size={16} strokeWidth={1.5} />}
                <span className="text-sm">{isSoundEnabled ? 'On' : 'Off'}</span>
              </button>
            </Row>

            <Row label="Font size">
              <button
                onClick={(e) => { e.stopPropagation(); cycleFontSize(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="text-sm font-medium">{fontSize}px</span>
                <span className="text-xs text-zinc-400">tap to cycle</span>
              </button>
            </Row>

            <Row label="Word display">
              <button
                onClick={(e) => { e.stopPropagation(); onCenteredWordToggle(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <span className="text-sm">{centeredWord ? 'Centered' : 'Random'}</span>
              </button>
            </Row>

            <Row label="Timer">
              <button
                onClick={(e) => { e.stopPropagation(); onTimerToggle(); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                  text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
              >
                <Clock size={16} strokeWidth={1.5} />
                <span className="text-sm">{timerEnabled ? 'On' : 'Off'}</span>
              </button>
            </Row>

          </motion.div>

          <p className="absolute bottom-6 inset-x-0 text-center text-xs text-zinc-300 dark:text-zinc-700 pointer-events-none">
            tap anywhere to close
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
