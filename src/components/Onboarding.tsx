'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import {
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Type,
  Repeat2,
  Wind,
  Lightbulb,
  Mic,
  LayoutGrid,
  ALargeSmall,
  Timer,
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
  controls: LayoutGrid,
  text: ALargeSmall,
  timer: Timer,
} as const;

// Tailwind color classes per accent (kept static so they survive purging).
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
const ACCENT_RING: Record<string, string> = {
  zinc: 'ring-zinc-200/90',
  sky: 'ring-sky-400/90',
  emerald: 'ring-emerald-400/90',
  violet: 'ring-violet-400/90',
  amber: 'ring-amber-400/90',
  rose: 'ring-rose-400/90',
};

// Padding around the highlighted control, in px.
const SPOT_PAD = 8;
const CARD_W = 300;

type Spot = { step: number; x: number; y: number; w: number; h: number; below: boolean; vw: number; vh: number };

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

  // Measured rect of the real control this step points at (spotlight steps only).
  const [spot, setSpot] = useState<Spot | null>(null);

  // Drive the live demo behind the card.
  useEffect(() => {
    if (cur.mode) onEnterStep(cur.mode);
  }, [step, cur.mode, onEnterStep]);

  // Locate + measure the anchored control. The control may mount a frame after the
  // mode switch above, so retry across a few animation frames before giving up.
  useLayoutEffect(() => {
    if (!cur.spotlight) {
      setSpot(null);
      return;
    }
    let raf = 0;
    let tries = 0;
    const measure = () => {
      const el = document.querySelector(`[data-onb="${cur.spotlight}"]`);
      if (el) {
        const r = el.getBoundingClientRect();
        setSpot({
          step,
          x: r.left,
          y: r.top,
          w: r.width,
          h: r.height,
          below: r.top < window.innerHeight * 0.5,
          vw: window.innerWidth,
          vh: window.innerHeight,
        });
      } else if (tries++ < 12) {
        raf = requestAnimationFrame(measure);
      }
    };
    measure();
    window.addEventListener('resize', measure);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
    };
  }, [step, cur.spotlight]);

  const advance = useCallback(() => {
    if (step >= total - 1) onDone();
    else setStep(s => s + 1);
  }, [step, total, onDone]);

  const goBack = useCallback(() => setStep(s => Math.max(0, s - 1)), []);

  const Icon = cur.icon ? ICONS[cur.icon] : null;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  const dots = (
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
  );

  const footer = (
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
        className="flex items-center gap-2 rounded-full bg-zinc-50 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white transition-colors"
      >
        {step === total - 1 ? o.start : o.next}
        <NextIcon size={14} strokeWidth={2.4} />
      </button>
    </div>
  );

  // Position of the callout card relative to the highlighted control.
  const cardLeft = spot
    ? Math.min(Math.max(spot.x + spot.w / 2 - CARD_W / 2, 16), spot.vw - CARD_W - 16)
    : 0;
  const cardPos: React.CSSProperties = spot
    ? spot.below
      ? { left: cardLeft, top: spot.y + spot.h + SPOT_PAD + 10 }
      : { left: cardLeft, top: spot.y - SPOT_PAD - 10, transform: 'translateY(-100%)' }
    : { left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
  // The callout is a single persistent node — never mounted/unmounted per step — so it
  // can't flash mount→unmount→mount. It only fades when there's no fresh measurement.
  const calloutReady = !!spot && spot.step === step;

  return (
    <motion.div
      dir={lang.direction}
      className="absolute inset-0 z-[90] cursor-pointer flex flex-col justify-end"
      onClick={advance}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {cur.spotlight ? (
        <>
          {/* Dim everything except the highlighted control via a giant box-shadow cutout. */}
          {spot ? (
            <div
              className={`absolute rounded-2xl ring-2 ${ACCENT_RING[accent]} pointer-events-none transition-all duration-300`}
              style={{
                left: spot.x - SPOT_PAD,
                top: spot.y - SPOT_PAD,
                width: spot.w + SPOT_PAD * 2,
                height: spot.h + SPOT_PAD * 2,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
              }}
            />
          ) : (
            <div className="absolute inset-0 bg-black/70 pointer-events-none" />
          )}

          {/* Callout anchored to the control. Positioning + fade are driven by state on a
              single persistent node (no per-step mount/unmount, no AnimatePresence wait),
              so content swaps instantly between steps and only fades in on first measure. */}
          <motion.div
            dir={lang.direction}
            onClick={e => e.stopPropagation()}
            className="absolute w-[300px] max-w-[calc(100vw-32px)] rounded-2xl bg-zinc-900/95 backdrop-blur ring-1 ring-white/10 px-5 py-4 cursor-default"
            style={{ ...cardPos, pointerEvents: calloutReady ? 'auto' : 'none' }}
            initial={false}
            animate={{ opacity: calloutReady ? 1 : 0 }}
            transition={{ duration: 0.2, ease: EASE }}
          >
            {dots}
            {cur.eyebrow && (
              <div className={`flex items-center gap-2 mb-2 ${ACCENT_TEXT[accent]}`}>
                {Icon && <Icon size={15} strokeWidth={2} />}
                <span className="font-mono text-[10px] tracking-[0.2em] uppercase">
                  {cur.eyebrow}
                </span>
              </div>
            )}
            <h2 className="text-xl font-bold leading-tight tracking-tight text-zinc-50 mb-2">
              {cur.title}
            </h2>
            <p className="text-sm leading-relaxed text-zinc-300">{cur.body}</p>
            {cur.how && (
              <div className="flex items-start gap-3 rounded-xl bg-white/10 px-3 py-2.5 mt-3">
                <span className="font-mono text-[10px] tracking-[0.15em] text-zinc-400 mt-0.5 shrink-0">
                  HOW
                </span>
                <span className="text-sm leading-relaxed text-zinc-100">{cur.how}</span>
              </div>
            )}
            {footer}
          </motion.div>
        </>
      ) : (
        <>
          {/* Gradient scrim: live content reads through up top, copy sits in the dark bottom. */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/90 pointer-events-none" />

          <div className="relative px-8 pb-10 pt-6">
            {dots}

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

            {footer}
          </div>
        </>
      )}
    </motion.div>
  );
}
