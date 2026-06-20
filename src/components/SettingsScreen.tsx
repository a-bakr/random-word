'use client';

import { Volume2, VolumeX, Moon, Sun, LayoutDashboard, User, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const MAX_WORDS  = [1, 2, 3, 5, 10];
const TIP_COUNTS = [0, 1, 2, 3];

export interface AccountProps {
  isRegistered: boolean;
  email?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
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

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="w-4 h-4" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function ProfileHeader({ account }: { account: AccountProps }) {
  const { lang } = useLanguage();
  const a = lang.labels.account;

  const avatar = account.isRegistered && account.avatarUrl ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={account.avatarUrl}
      alt=""
      referrerPolicy="no-referrer"
      className="h-14 w-14 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
    />
  ) : (
    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
      <User size={24} strokeWidth={1.8} className="text-zinc-400 dark:text-zinc-500" />
    </div>
  );

  return (
    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-900">
      {avatar}
      <div className="min-w-0 flex-1">
        {account.isRegistered ? (
          <>
            <div className="text-base font-medium text-zinc-900 dark:text-zinc-50 truncate">
              {account.name || account.email}
            </div>
            <div className="text-xs text-zinc-400 dark:text-zinc-600 truncate">{account.email}</div>
          </>
        ) : (
          <>
            <div className="text-base font-medium text-zinc-900 dark:text-zinc-50">{a.guest}</div>
            <div className="text-xs text-zinc-400 dark:text-zinc-600">{a.syncCta}</div>
          </>
        )}
      </div>
      {account.isRegistered ? (
        <button
          onClick={account.onSignOut}
          className="flex-shrink-0 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs
            text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          {a.signOut}
        </button>
      ) : (
        <button
          onClick={account.onLinkGoogle}
          className="flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs
            text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
        >
          <GoogleIcon />
          {a.continueWithGoogle}
        </button>
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
  onOpenPaywall,
  isPremium,
  subscriptionEnd,
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
  onOpenPaywall: () => void;
  isPremium: boolean;
  subscriptionEnd: string | null;
  account: AccountProps;
}) {
  const { lang } = useLanguage();
  const s = lang.labels.settings;

  const planText = isPremium
    ? subscriptionEnd
      ? `${s.planPremium} · ${s.planExpires} ${new Date(subscriptionEnd).toLocaleDateString(lang.code)}`
      : s.planPremium
    : s.planFree;

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
        <h2 className="text-[clamp(36px,8vw,64px)] leading-none font-medium tracking-tight text-zinc-900 dark:text-zinc-50 mb-8">
          {s.title}
        </h2>

        <ProfileHeader account={account} />

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

        <Row label={s.plan}>
          <button
            onClick={onOpenPaywall}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-full transition-colors ${
              isPremium
                ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                : 'bg-amber-500/15 dark:bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 dark:hover:bg-amber-500/25'
            }`}
          >
            <span className="text-sm font-medium">{planText}</span>
            {!isPremium && <ChevronRight size={14} strokeWidth={2.4} />}
          </button>
        </Row>

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
