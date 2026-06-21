'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Type,
  Repeat2,
  Wind,
  Lightbulb,
  Mic,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

type StepMode = 'words' | 'twisters' | 'warmup';

const EASE = [0.16, 1, 0.3, 1] as const;

const ICONS = {
  spark: Sparkles,
  words: Type,
  twisters: Repeat2,
  warmup: Wind,
  tips: Lightbulb,
  mic: Mic,
} as const;

// Tailwind text-color classes per accent (kept static so they survive purging).
const ACCENT_TEXT: Record<string, string> = {
  zinc: 'text-zinc-300',
  sky: 'text-sky-400',
  emerald: 'text-emerald-400',
  violet: 'text-violet-400',
  amber: 'text-amber-400',
  rose: 'text-rose-400',
};
const ACCENT_DOT: Record<string, string> = {
  zinc: 'bg-zinc-200',
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-400',
  violet: 'bg-violet-400',
  amber: 'bg-amber-400',
  rose: 'bg-rose-400',
};

export function Onboarding({
  onEnterStep,
  onDone,
}: {
  /** Called whenever a step becomes active, so the host can switch the live mode behind the card. */
  onEnterStep: (mode: StepMode) => void;
  /** Finish or skip — host resets to Words and persists the "onboarded" flag. */
  onDone: () => void;
}) {
  const { lang } = useLanguage();
  const o = lang.labels.onboarding;
  const steps = o.steps;
  const total = steps.length;
  const isRtl = lang.direction === 'rtl';

  const [step, setStep] = useState(0);
  const cur = steps[step];
  const accent = cur.accent ?? 'zinc';

  // Drive the live demo behind the card.
  useEffect(() => {
    if (cur.mode) onEnterStep(cur.mode);
  }, [step, cur.mode, onEnterStep]);

  const advance = useCallback(() => {
    if (step >= total - 1) onDone();
    else setStep(s => s + 1);
  }, [step, total, onDone]);

  const goBack = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  const Icon = cur.icon ? ICONS[cur.icon] : null;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <motion.div
      dir={lang.direction}
      className="absolute inset-0 z-[90] cursor-pointer flex flex-col justify-end"
      onClick={advance}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Gradient scrim: live content reads through up top, copy sits in the dark bottom. */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90 pointer-events-none" />

      <div className="relative px-8 pb-10 pt-6">
        {/* progress dots */}
        <div className="flex items-center gap-1.5 mb-5">
          {steps.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === step ? `w-6 ${ACCENT_DOT[accent]}` : 'w-1.5 bg-white/25'
              }`}
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            {cur.eyebrow && (
              <div className={`flex items-center gap-2 mb-3 ${ACCENT_TEXT[accent]}`}>
                {Icon && <Icon size={16} strokeWidth={2} />}
                <span className="font-mono text-[11px] tracking-[0.2em] uppercase">
                  {cur.eyebrow}
                </span>
              </div>
            )}
            {!cur.eyebrow && Icon && (
              <Icon size={22} strokeWidth={2} className={`${ACCENT_TEXT[accent]} mb-3`} />
            )}

            <h2 className="text-3xl font-bold leading-tight tracking-tight text-zinc-50 mb-3">
              {cur.title}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300 mb-5">{cur.body}</p>

            {cur.how && (
              <div className="flex items-start gap-3 rounded-xl bg-white/10 px-3.5 py-3 mb-1">
                <span className="font-mono text-[10px] tracking-[0.15em] text-zinc-400 mt-0.5 shrink-0">
                  HOW
                </span>
                <span className="text-sm leading-relaxed text-zinc-100">{cur.how}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* footer */}
        <div className="flex items-center justify-between mt-6 pointer-events-auto">
          <div className="flex items-center gap-4">
            {step > 0 && (
              <button
                onClick={e => { e.stopPropagation(); goBack(); }}
                className="font-mono text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {o.back}
              </button>
            )}
            <button
              onClick={e => { e.stopPropagation(); onDone(); }}
              className="font-mono text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              {o.skip}
            </button>
          </div>
          <button
            onClick={e => { e.stopPropagation(); advance(); }}
            className="flex items-center gap-2 rounded-full bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors"
          >
            {step === total - 1 ? o.start : o.next}
            <NextIcon size={14} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
