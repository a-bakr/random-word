'use client';

import { useCallback, useEffect, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

type Rect = { top: number; left: number; width: number; height: number };

// One target per onboarding step. `null` = a synthetic centered box (the tap step).
const TARGETS: (string | null)[] = [
  null,
  '[data-onb="modes"]',
  '[data-onb="record"]',
  '[data-onb="pace"]',
];

const PAD = 10;

function measure(step: number): Rect {
  if (typeof window === 'undefined') return { top: 0, left: 0, width: 0, height: 0 };
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const sel = TARGETS[step];
  if (sel) {
    const el = document.querySelector(sel);
    if (el) {
      const r = el.getBoundingClientRect();
      return {
        top: r.top - PAD,
        left: r.left - PAD,
        width: r.width + PAD * 2,
        height: r.height + PAD * 2,
      };
    }
  }
  // Synthetic centered spotlight for the "whole screen is a button" step.
  const w = Math.min(vw * 0.7, 360);
  const h = vh * 0.26;
  return { top: (vh - h) / 2, left: (vw - w) / 2, width: w, height: h };
}

function toArabicNum(n: number, _ar: boolean): string {
  return String(n);
}

export function Onboarding({
  onAdvanceStep,
  onDone,
}: {
  /** Called when leaving a given step index (so the host can react, e.g. generate a word). */
  onAdvanceStep: (step: number) => void;
  onDone: () => void;
}) {
  const { lang } = useLanguage();
  const o = lang.labels.onboarding;
  const total = o.steps.length;

  const [step, setStep] = useState(0);
  const [rect, setRect] = useState<Rect>(() => measure(0));

  useEffect(() => {
    const update = () => setRect(measure(step));
    update();
    // Re-measure after layout settles and on resize.
    const id = window.setTimeout(update, 60);
    window.addEventListener('resize', update);
    return () => {
      window.clearTimeout(id);
      window.removeEventListener('resize', update);
    };
  }, [step]);

  const advance = useCallback(() => {
    onAdvanceStep(step);
    if (step >= total - 1) onDone();
    else setStep(s => s + 1);
  }, [step, total, onAdvanceStep, onDone]);

  const cur = o.steps[step];
  const cardBelow = rect.top < window.innerHeight / 2;
  const cardStyle: React.CSSProperties = cardBelow
    ? { top: rect.top + rect.height + 22 }
    : { bottom: window.innerHeight - rect.top + 22 };

  return (
    <motion.div
      dir={lang.direction}
      className="absolute inset-0 z-[90] cursor-pointer"
      onClick={advance}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* spotlight: a clear hole punched out of a dark scrim via a huge box-shadow */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
          borderRadius: 20,
          boxShadow: '0 0 0 9999px rgba(0,0,0,0.74)',
          border: '2px solid rgba(250,250,250,0.9)',
          transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
        }}
      />

      <div className="absolute inset-x-6 pointer-events-none" style={cardStyle}>
        <div className="font-mono text-[10px] tracking-[0.2em] text-zinc-400 mb-3">
          {toArabicNum(step + 1, lang.direction === 'rtl')} / {toArabicNum(total, lang.direction === 'rtl')}
        </div>
        <div className="text-2xl font-bold leading-snug tracking-tight text-zinc-50 mb-2">
          {cur.title}
        </div>
        <div className="text-sm leading-relaxed text-zinc-400 mb-6">{cur.body}</div>
        <div className="flex items-center justify-between pointer-events-auto">
          <button
            onClick={e => { e.stopPropagation(); onDone(); }}
            className="font-mono text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            {o.skip}
          </button>
          <button
            onClick={e => { e.stopPropagation(); advance(); }}
            className="flex items-center gap-2 rounded-full bg-zinc-50 px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors"
          >
            {step === total - 1 ? o.start : o.next}
            <ChevronRight size={14} strokeWidth={2.4} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
