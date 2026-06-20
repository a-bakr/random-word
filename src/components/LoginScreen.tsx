'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../contexts/LanguageContext';

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-5 h-5" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

export function LoginScreen({ onSignIn }: { onSignIn: () => Promise<unknown> }) {
  const { lang } = useLanguage();
  const a = lang.labels.account;
  const ab = lang.labels.about;
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await onSignIn();
    } catch {
      setLoading(false);
    }
  };

  return (
    <motion.div
      dir={lang.direction}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col items-center text-center max-w-sm w-full">
        <h1 className="text-[clamp(40px,12vw,72px)] leading-none font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
          {ab.appName}
        </h1>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">{ab.appTagline}</p>

        <button
          onClick={handleSignIn}
          disabled={loading}
          className="mt-12 flex w-full items-center justify-center gap-3 rounded-full border border-zinc-200 dark:border-zinc-800
            bg-white dark:bg-zinc-900 px-6 py-4 text-sm font-medium text-zinc-800 dark:text-zinc-100
            hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-60"
        >
          <GoogleIcon />
          {a.continueWithGoogle}
        </button>
        <p className="mt-6 text-xs text-zinc-400 dark:text-zinc-600">{a.loginPrompt}</p>
      </div>
    </motion.div>
  );
}
