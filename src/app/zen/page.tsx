'use client';

import { useEffect, useState, useCallback } from 'react';

type Win = '24h' | '7d' | '30d';

interface Summary {
  now: number;
  today: number;
  period: number;
  events: { name: string; n: number }[];
  countries: { country: string; n: number }[];
  referrers: { referrer: string; n: number }[];
}

interface Point {
  bucket: string;
  sessions: number;
  words: number;
  recordings: number;
}

interface FeedItem {
  name: string;
  country: string | null;
  device: string | null;
  browser: string | null;
  ts: string;
}

function fmt(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'm';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'k';
  return String(n);
}

function ago(ts: string): string {
  const s = (Date.now() - new Date(ts).getTime()) / 1000;
  if (s < 60) return `${Math.round(s)}s`;
  if (s < 3600) return `${Math.round(s / 60)}m`;
  return `${Math.round(s / 3600)}h`;
}

function Bars({ data }: { data: number[] }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-px h-12">
      {data.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm bg-zinc-300 dark:bg-zinc-700 transition-all duration-500"
          style={{ height: v === 0 ? 1 : `${Math.max((v / max) * 100, 4)}%` }}
        />
      ))}
    </div>
  );
}

function HBar({ label, value, max }: { label: string; value: number; max: number }) {
  return (
    <div className="flex items-center gap-3 group">
      <span className="w-28 text-xs text-zinc-400 truncate text-right shrink-0">{label}</span>
      <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800">
        <div
          className="h-full bg-zinc-400 dark:bg-zinc-500 transition-all duration-700"
          style={{ width: `${(value / max) * 100}%` }}
        />
      </div>
      <span className="w-8 text-xs font-mono text-zinc-400 shrink-0">{fmt(value)}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-zinc-100 dark:border-zinc-900" />;
}

export default function ZenPage() {
  const [win, setWin] = useState<Win>('7d');
  const [summary, setSummary] = useState<Summary | null>(null);
  const [series, setSeries] = useState<Point[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);

  useEffect(() => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', dark);
  }, []);

  const load = useCallback(async (w: Win) => {
    const [s, ts, f] = await Promise.all([
      fetch(`/api/zen/summary?window=${w}`).then(r => r.json()),
      fetch(`/api/zen/timeseries?window=${w}`).then(r => r.json()),
      fetch('/api/zen/feed').then(r => r.json()),
    ]);
    setSummary(s);
    setSeries(ts);
    setFeed(f);
  }, []);

  useEffect(() => { load(win); }, [win, load]);

  useEffect(() => {
    const t = setInterval(() => load(win), 30_000);
    return () => clearInterval(t);
  }, [win, load]);

  const winLabel = win === '24h' ? '24 hours' : win === '7d' ? '7 days' : '30 days';

  return (
    <div className="h-dvh overflow-y-auto bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      <div className="max-w-xl mx-auto px-8 py-16 space-y-12">

        <div className="flex items-baseline justify-between">
          <span className="text-xs font-mono tracking-widest text-zinc-400">zen</span>
          <div className="flex gap-4">
            {(['24h', '7d', '30d'] as Win[]).map(w => (
              <button
                key={w}
                onClick={() => setWin(w)}
                className={`text-xs font-mono transition-colors duration-200 ${
                  win === w
                    ? 'text-zinc-900 dark:text-zinc-100'
                    : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <Divider />

        <div className="grid grid-cols-3 gap-8">
          {[
            { label: 'now', sub: 'active', value: summary ? String(summary.now) : '—' },
            { label: 'today', sub: 'sessions', value: summary ? fmt(summary.today) : '—' },
            { label: winLabel, sub: 'sessions', value: summary ? fmt(summary.period) : '—' },
          ].map(({ label, sub, value }) => (
            <div key={label} className="space-y-1">
              <div className="text-3xl font-light font-mono">{value}</div>
              <div className="text-xs text-zinc-400">{label}</div>
              <div className="text-xs text-zinc-300 dark:text-zinc-600">{sub}</div>
            </div>
          ))}
        </div>

        {series.length > 0 && (
          <>
            <Divider />
            <div className="space-y-3">
              <div className="text-xs font-mono text-zinc-400">sessions · {winLabel}</div>
              <Bars data={series.map(p => p.sessions)} />
            </div>
          </>
        )}

        {summary && summary.countries.length > 0 && (
          <>
            <Divider />
            <div className="grid grid-cols-2 gap-10">
              <div className="space-y-3">
                <div className="text-xs font-mono text-zinc-400">countries</div>
                {summary.countries.map(r => (
                  <HBar key={r.country} label={r.country} value={r.n} max={summary.countries[0].n} />
                ))}
              </div>
              <div className="space-y-3">
                <div className="text-xs font-mono text-zinc-400">referrers</div>
                {summary.referrers.length === 0 ? (
                  <span className="text-xs text-zinc-400">direct</span>
                ) : (
                  summary.referrers.map(r => (
                    <HBar key={r.referrer} label={r.referrer} value={r.n} max={summary.referrers[0].n} />
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {summary && summary.events.length > 0 && (
          <>
            <Divider />
            <div className="space-y-3">
              <div className="text-xs font-mono text-zinc-400">activity · {winLabel}</div>
              {summary.events.map(e => (
                <div key={e.name} className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500 font-mono">{e.name.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-mono text-zinc-900 dark:text-zinc-100">{fmt(e.n)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {feed.length > 0 && (
          <>
            <Divider />
            <div className="space-y-3">
              <div className="text-xs font-mono text-zinc-400">recent</div>
              {feed.map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-zinc-600 dark:text-zinc-300 truncate">
                    {item.name.replace(/_/g, ' ')}
                  </span>
                  {item.country && (
                    <span className="text-zinc-400">{item.country}</span>
                  )}
                  {item.device && (
                    <span className="text-zinc-300 dark:text-zinc-600">{item.device}</span>
                  )}
                  <span className="ml-auto text-zinc-300 dark:text-zinc-600 shrink-0">{ago(item.ts)}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}
