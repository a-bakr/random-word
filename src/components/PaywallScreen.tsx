'use client';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import type { PlanId } from '../lib/billing';

export function PaywallScreen({
  onBack,
  onSubscribe,
  loading = false,
}: {
  onBack: () => void;
  onSubscribe: (plan: PlanId) => void;
  loading?: boolean;
}) {
  const { lang } = useLanguage();
  const p = lang.labels.premium;
  const BackIcon = lang.direction === 'rtl' ? ChevronRight : ChevronLeft;

  return (
    <motion.div
      dir={lang.direction}
      className="absolute inset-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950"
      onClick={e => e.stopPropagation()}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        onClick={e => { e.stopPropagation(); onBack(); }}
        className="absolute top-6 start-4 z-10 rounded-full p-3 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        aria-label="Back"
      >
        <BackIcon size={22} strokeWidth={2.5} />
      </button>

      <div className="flex flex-col px-8 pt-20 pb-40 max-w-lg mx-auto w-full">
        <p className="text-xs tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-3">
          {p.eyebrow}
        </p>
        <h2 className="text-[clamp(28px,7vw,40px)] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8">
          {p.title}
        </h2>

        <div className="flex flex-col gap-4 mb-8">
          {p.features.map(f => (
            <div key={f} className="flex items-center gap-3">
              <Check size={18} strokeWidth={2.4} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <span className="text-sm text-zinc-700 dark:text-zinc-300">{f}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => onSubscribe('yearly')}
            disabled={loading}
            className="relative flex items-center justify-between rounded-2xl border-[1.5px] border-amber-500 bg-amber-500/10 dark:bg-amber-500/10 px-4 py-4 text-start disabled:opacity-60"
          >
            <div>
              <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{p.yearly}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{p.perMonth}</div>
            </div>
            <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">{p.yearlyPrice}</div>
            <div className="absolute -top-2.5 start-4 rounded bg-amber-500 px-2 py-0.5 text-[9px] tracking-[0.1em] text-white dark:text-zinc-950 font-medium">
              {p.save}
            </div>
          </button>
          <button
            onClick={() => onSubscribe('monthly')}
            disabled={loading}
            className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 py-4 text-start disabled:opacity-60"
          >
            <div className="text-base font-semibold text-zinc-700 dark:text-zinc-300">{p.monthly}</div>
            <div className="text-base font-bold text-zinc-700 dark:text-zinc-300">{p.monthlyPrice}</div>
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 inset-x-0 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 px-8 pt-5 pb-7 max-w-lg mx-auto">
        <button
          onClick={() => onSubscribe('yearly')}
          disabled={loading}
          className="w-full rounded-full bg-zinc-900 dark:bg-zinc-50 py-4 text-center text-sm font-semibold text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity mb-3 disabled:opacity-60"
        >
          {loading ? p.processing : p.subscribe}
        </button>
        <div className="flex items-center justify-center gap-4">
          <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{p.trialNote}</span>
        </div>
      </div>
    </motion.div>
  );
}
