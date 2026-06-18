'use client';

import { useState } from 'react';
import { Volume2, VolumeX, Moon, Sun, LayoutDashboard } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const MAX_WORDS  = [1, 2, 3, 5, 10];
const TIP_COUNTS = [0, 1, 2, 3];

export interface AccountProps {
  isRegistered: boolean;
  email?: string | null;
  onLinkEmail: (email: string) => Promise<unknown>;
  onLinkGoogle: () => void;
  onSignOut: () => void;
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-zinc-100 dark:border-zinc-900">
      <span className="text-base text-zinc-600 dark:text-zinc-400">{label}</span>
      {children}
    </div>
  );
}

function AccountSection({ account }: { account: AccountProps }) {
  const { lang } = useLanguage();
  const a = lang.labels.account;
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  if (account.isRegistered) {
    return (
      <Row label={a.signedInAs}>
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate max-w-[12rem]">
            {account.email}
          </span>
          <button
            onClick={account.onSignOut}
            className="text-xs text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors underline underline-offset-2"
          >
            {a.signOut}
          </button>
        </div>
      </Row>
    );
  }

  return (
    <div className="py-4 border-b border-zinc-100 dark:border-zinc-900">
      <p className="text-base text-zinc-600 dark:text-zinc-400">{a.syncCta}</p>
      <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-1 mb-3">{a.syncDescription}</p>
      {sent ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">{a.checkEmail}</p>
      ) : (
        <div className="flex flex-col gap-2">
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (!email) return;
              await account.onLinkEmail(email);
              setSent(true);
            }}
            className="flex gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder={a.emailPlaceholder}
              className="flex-1 px-3 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-sm
                text-zinc-700 dark:text-zinc-300 outline-none"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-full bg-zinc-900 dark:bg-zinc-100 text-sm
                text-zinc-50 dark:text-zinc-900 hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              {a.continueWithEmail}
            </button>
          </form>
          <button
            onClick={account.onLinkGoogle}
            className="px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-sm
              text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {a.continueWithGoogle}
          </button>
        </div>
      )}
    </div>
  );
}

export function SettingsScreen({
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
  onOpenDashboard,
  account,
}: {
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
  onOpenDashboard: () => void;
  account: AccountProps;
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
    <div
      dir={lang.direction}
      className="absolute inset-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex flex-col px-8 pt-24 pb-24 max-w-lg mx-auto w-full">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 mb-2">
          {s.preferences}
        </p>
        <h2 className="text-[clamp(36px,8vw,64px)] leading-none font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-10">
          {s.title}
        </h2>

        <Row label={s.theme}>
          <button
            onClick={onThemeToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
              text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            {isDark ? <Moon size={16} strokeWidth={1.5} /> : <Sun size={16} strokeWidth={1.5} />}
            <span className="text-sm">{isDark ? s.themeDark : s.themeLight}</span>
          </button>
        </Row>

        <Row label={s.sound}>
          <button
            onClick={onSoundToggle}
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
            onClick={cycleMaxWords}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
              text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="text-sm font-medium">{maxWords === 10 ? '∞' : maxWords}</span>
            <span className="text-xs text-zinc-400">{s.tapToCycle}</span>
          </button>
        </Row>

        <Row label={s.wordDisplay}>
          <button
            onClick={onCenteredWordToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
              text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="text-sm">{centeredWord ? s.wordCentered : s.wordRandom}</span>
          </button>
        </Row>

        <Row label={s.coachingTips}>
          <button
            onClick={cycleTipCount}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
              text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <span className="text-sm font-medium">{tipCount === 0 ? s.off : tipCount}</span>
            <span className="text-xs text-zinc-400">{s.tapToCycle}</span>
          </button>
        </Row>

        <AccountSection account={account} />

        {isAdmin && (
          <Row label={s.admin}>
            <button
              onClick={onOpenDashboard}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900
                text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            >
              <LayoutDashboard size={16} strokeWidth={1.5} />
              <span className="text-sm">{s.dashboard}</span>
            </button>
          </Row>
        )}
      </div>
    </div>
  );
}
