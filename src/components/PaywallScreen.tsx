'use client';

import { useEffect, useRef, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Clock3, Copy, ImagePlus } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';
import { track } from '../lib/track';
import type { PlanId } from '../lib/billing';

const WALLET_NUMBER = process.env.NEXT_PUBLIC_PAYMENT_WALLET_NUMBER || '';

type Wallet = 'instapay' | 'vodafone_cash';

/** Downscale/recompress the screenshot so the upload stays well under the 4 MB API cap. */
async function compressImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
    if (!blob) return file;
    return new File([blob], 'proof.jpg', { type: 'image/jpeg' });
  } catch {
    return file; // undecodable in this browser — send as-is, the server enforces the size cap
  }
}

export function PaywallScreen({
  onBack,
  requestStatus,
  onSubmitted,
}: {
  onBack: () => void;
  /** Latest manual subscription request status for this user, if any. */
  requestStatus: 'pending' | 'approved' | 'rejected' | null;
  onSubmitted: () => void;
}) {
  const { lang } = useLanguage();
  const p = lang.labels.premium;
  const m = lang.labels.manualPay;
  const BackIcon = lang.direction === 'rtl' ? ChevronRight : ChevronLeft;

  const [plan, setPlan] = useState<PlanId | null>(null);
  const [wallet, setWallet] = useState<Wallet>('instapay');
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const pickFile = (f: File | null) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(f ? URL.createObjectURL(f) : null);
  };

  const copyNumber = async () => {
    try {
      await navigator.clipboard.writeText(WALLET_NUMBER);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch { /* clipboard unavailable — number stays visible to copy manually */ }
  };

  const submit = async () => {
    if (!plan || !file || submitting) return;
    setSubmitting(true);
    setError(false);
    try {
      const compressed = await compressImage(file);
      const form = new FormData();
      form.append('plan', plan);
      form.append('wallet', wallet);
      form.append('file', compressed);
      const res = await fetch('/api/subscription-request', { method: 'POST', body: form });
      if (!res.ok && res.status !== 409) throw new Error(`submit ${res.status}`);
      track('subscription_request_submitted', { plan, wallet });
      onSubmitted();
    } catch (err) {
      console.error('[subscription-request]', err);
      setError(true);
      setSubmitting(false);
    }
  };

  const pending = requestStatus === 'pending';
  const step: 'plans' | 'pay' | 'pending' = pending ? 'pending' : plan ? 'pay' : 'plans';

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
        onClick={e => { e.stopPropagation(); step === 'pay' ? setPlan(null) : onBack(); }}
        className="absolute top-6 start-4 z-10 rounded-full p-3 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors"
        aria-label="Back"
      >
        <BackIcon size={22} strokeWidth={2.5} />
      </button>

      {step === 'pending' && (
        <div className="flex flex-col items-center justify-center px-8 pt-24 pb-24 max-w-lg mx-auto w-full min-h-full text-center">
          <div className="rounded-full bg-amber-500/10 p-5 mb-6">
            <Clock3 size={32} strokeWidth={2} className="text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
            {m.pendingTitle}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs">
            {m.pendingBody}
          </p>
        </div>
      )}

      {step === 'plans' && (
        <>
          <div className="flex flex-col px-8 pt-20 pb-40 max-w-lg mx-auto w-full">
            <p className="text-xs tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-3">
              {p.eyebrow}
            </p>
            <h2 className="text-[clamp(28px,7vw,40px)] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-8">
              {p.title}
            </h2>

            {requestStatus === 'rejected' && (
              <p className="mb-6 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 px-4 py-3 text-xs text-rose-600 dark:text-rose-400">
                {m.rejectedNote}
              </p>
            )}

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
                onClick={() => setPlan('yearly')}
                className="relative flex items-center justify-between rounded-2xl border-[1.5px] border-amber-500 bg-amber-500/10 dark:bg-amber-500/10 px-4 py-4 text-start"
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
                onClick={() => setPlan('monthly')}
                className="flex items-center justify-between rounded-2xl border border-zinc-200 dark:border-zinc-800 px-4 py-4 text-start"
              >
                <div className="text-base font-semibold text-zinc-700 dark:text-zinc-300">{p.monthly}</div>
                <div className="text-base font-bold text-zinc-700 dark:text-zinc-300">{p.monthlyPrice}</div>
              </button>
            </div>
          </div>

          <div className="absolute bottom-0 inset-x-0 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-900 px-8 pt-5 pb-7 max-w-lg mx-auto">
            <button
              onClick={() => setPlan('yearly')}
              className="w-full rounded-full bg-zinc-900 dark:bg-zinc-50 py-4 text-center text-sm font-semibold text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity mb-3"
            >
              {p.subscribe}
            </button>
            <div className="flex items-center justify-center gap-4">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{p.trialNote}</span>
            </div>
          </div>
        </>
      )}

      {step === 'pay' && plan && (
        <div className="flex flex-col px-8 pt-20 pb-16 max-w-lg mx-auto w-full">
          <p className="text-xs tracking-[0.2em] uppercase text-amber-600 dark:text-amber-400 mb-3">
            {p.eyebrow}
          </p>
          <h2 className="text-[clamp(24px,6vw,32px)] leading-tight font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
            {m.payTitle}
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed mb-8">
            {m.payBody}
          </p>

          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-900 mb-6">
            <div className="flex items-center justify-between px-4 py-3.5">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{m.amountLabel}</span>
              <span className="text-sm font-bold text-zinc-900 dark:text-zinc-50">
                {plan === 'yearly' ? p.yearlyPrice : p.monthlyPrice}
                <span className="font-normal text-zinc-400 dark:text-zinc-500"> · {plan === 'yearly' ? p.yearly : p.monthly}</span>
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-shrink-0">{m.sendTo}</span>
              <div className="flex items-center gap-2 min-w-0">
                <span dir="ltr" className="text-sm font-bold tracking-wide text-zinc-900 dark:text-zinc-50 truncate">
                  {WALLET_NUMBER}
                </span>
                <button
                  onClick={copyNumber}
                  className="flex items-center gap-1 rounded-full border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 text-[10px] font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors flex-shrink-0"
                >
                  <Copy size={11} strokeWidth={2.2} />
                  {copied ? m.copied : m.copy}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3.5">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{m.walletUsed}</span>
              <div className="flex gap-1.5">
                {(['instapay', 'vodafone_cash'] as const).map(w => (
                  <button
                    key={w}
                    onClick={() => setWallet(w)}
                    className={`rounded-full px-3 py-1.5 text-[11px] font-medium border transition-colors ${
                      wallet === w
                        ? 'border-amber-500 bg-amber-500/10 text-zinc-900 dark:text-zinc-50'
                        : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400'
                    }`}
                  >
                    {w === 'instapay' ? m.instapay : m.vodafoneCash}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={e => pickFile(e.target.files?.[0] ?? null)}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 px-4 py-6 mb-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors overflow-hidden"
          >
            {previewUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={previewUrl} alt="" className="max-h-48 rounded-lg object-contain" />
                <span className="text-xs font-medium">{m.changeImage}</span>
              </>
            ) : (
              <>
                <ImagePlus size={22} strokeWidth={2} />
                <span className="text-xs font-medium">{m.uploadProof}</span>
              </>
            )}
          </button>

          {error && (
            <p className="mb-4 text-center text-xs text-rose-500">{m.submitError}</p>
          )}

          <button
            onClick={submit}
            disabled={!file || submitting}
            className="w-full rounded-full bg-zinc-900 dark:bg-zinc-50 py-4 text-center text-sm font-semibold text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {submitting ? m.submitting : m.submit}
          </button>
        </div>
      )}
    </motion.div>
  );
}
