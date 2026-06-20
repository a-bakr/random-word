'use client';

import { useEffect, useState } from 'react';
import { Flame, Play } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { readCache, writeCache } from '../lib/statsCache';
import type { Recording } from '../types';

const STATS_CACHE_KEY = 'me_stats_cache';

type Stats = {
  streak: number;
  bestStreak: number;
  words: number;
  minutes: number;
  clips: number;
  activeDays: string[];
};

const DAY = 86_400_000;

/** ISO date (UTC) for `n` days ago, oldest-first when mapped over a range. */
function isoDaysAgo(n: number): string {
  return new Date(Date.now() - n * DAY).toISOString().slice(0, 10);
}

export function PracticeScreen({ recordings }: { recordings: Recording[] }) {
  const { lang } = useLanguage();
  const p = lang.labels.practice;
  // Paint instantly from the last known stats, then revalidate in the
  // background — no blank → spinner → data flash on every open.
  const [stats, setStats] = useState<Stats | null>(() => readCache<Stats>(STATS_CACHE_KEY));
  const [loading, setLoading] = useState(() => readCache<Stats>(STATS_CACHE_KEY) == null);

  useEffect(() => {
    let active = true;
    fetch('/api/me/stats')
      .then(r => (r.ok ? r.json() : null))
      .then(d => {
        if (active && d && !d.error) {
          setStats(d);
          writeCache(STATS_CACHE_KEY, d);
        }
      })
      .catch(() => {})
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  // Last 7 calendar days (oldest → newest), flagged active from the API set.
  const activeSet = new Set(stats?.activeDays ?? []);
  const week = Array.from({ length: 7 }, (_, i) => {
    const iso = isoDaysAgo(6 - i);
    const weekday = (new Date(iso + 'T00:00:00Z').getUTCDay() + 6) % 7; // Mon=0..Sun=6
    return { iso, active: activeSet.has(iso), letter: p.weekdayLetters[weekday] };
  });

  const streak = stats?.streak ?? 0;
  const best = stats?.bestStreak ?? 0;
  const clips = stats?.clips ?? recordings.length;
  const cards = [
    { value: String(stats?.words ?? 0), label: p.words },
    { value: `${stats?.minutes ?? 0}m`, label: p.practiced },
    { value: String(clips), label: p.clips },
  ];
  const recent = [...recordings].reverse();

  return (
    <div
      dir={lang.direction}
      className="absolute inset-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex flex-col px-8 pt-24 pb-24 max-w-lg mx-auto w-full">
        <p className="text-xs tracking-[0.2em] uppercase text-zinc-400 dark:text-zinc-600 mb-3">
          {p.title}
        </p>

        {/* Streak */}
        <div className="flex items-end gap-4 mb-1">
          <span className="text-7xl font-extrabold leading-[0.85] tracking-tight text-zinc-900 dark:text-zinc-50 tabular-nums">
            {streak}
          </span>
          <span className="flex items-center gap-2 pb-2 text-orange-500">
            <Flame size={20} strokeWidth={1.5} fill="currentColor" />
            <span className="text-base font-semibold text-zinc-600 dark:text-zinc-300">
              {p.dayStreak}
            </span>
          </span>
        </div>
        <p className="text-sm text-zinc-400 dark:text-zinc-500 mb-8 tabular-nums">
          {p.bestStreak} {best}
        </p>

        {/* Week heatmap */}
        <div className="flex justify-between mb-8">
          {week.map((d, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-[9px] ${
                  d.active
                    ? 'bg-orange-500'
                    : 'border border-dashed border-zinc-300 dark:border-zinc-700'
                }`}
              />
              <span className="text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                {d.letter}
              </span>
            </div>
          ))}
        </div>

        {/* Stat cards */}
        <div className="flex gap-2.5 mb-8">
          {cards.map((c, i) => (
            <div
              key={i}
              className="flex-1 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-3.5"
            >
              <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 tabular-nums">
                {loading ? '–' : c.value}
              </div>
              <div className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {/* Recent clips (this session) */}
        <p className="text-xs font-mono tracking-[0.16em] uppercase text-zinc-400 dark:text-zinc-600 mb-1.5">
          {p.recent}
        </p>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-400 dark:text-zinc-600 py-3">{p.empty}</p>
        ) : (
          <div className="flex flex-col">
            {recent.map(r => (
              <div
                key={r.id}
                className="flex items-center gap-3 py-3 border-b border-zinc-100 dark:border-zinc-900"
              >
                <span className="flex-none w-[30px] h-[30px] rounded-full border border-zinc-200 dark:border-zinc-700 flex items-center justify-center text-zinc-500 dark:text-zinc-400">
                  <Play size={13} strokeWidth={2.2} />
                </span>
                <span className="flex-1 min-w-0 truncate text-sm text-zinc-600 dark:text-zinc-300">
                  {r.transcript || lang.labels.ui.noTranscript}
                </span>
                <span className="font-mono text-[11px] text-zinc-400 dark:text-zinc-500 tabular-nums">
                  #{r.num}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
