'use client';

import { useEffect, useState, useCallback } from 'react';

type Win = '24h' | '7d' | '30d';
type Tab = 'overview' | 'users' | 'funnels' | 'acquisition';

interface Summary {
  now: number;
  today: number;
  period: number;
  users_today: number;
  users_period: number;
  events: { name: string; n: number }[];
  countries: { country: string; n: number }[];
  referrers: { referrer: string; n: number }[];
  devices: { device: string; n: number }[];
  browsers: { browser: string; n: number }[];
  oses: { os: string; n: number }[];
  utm_sources: { utm_source: string; n: number }[];
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

interface UserRow {
  user_id: string;
  is_anonymous: boolean;
  email: string | null;
  sessions: number;
  words: number;
  recordings: number;
  returning: boolean;
  first_seen: string;
  last_seen: string;
}

interface UsersData {
  totals: { total: number; registered: number; anonymous: number; new_today: number };
  returning: number;
  users: UserRow[];
}

interface Funnels {
  funnel: { visited: number; practiced: number; recorded: number };
  by_mode: { mode: string; n: number }[];
  by_language: { language: string; n: number }[];
  avg_events_per_session: number;
}

interface UserDetail {
  profile: Record<string, unknown> | null;
  sessions: Record<string, unknown>[];
  events: { name: string; ts: string; language: string | null }[];
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
  if (s < 86400) return `${Math.round(s / 3600)}h`;
  return `${Math.round(s / 86400)}d`;
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
    <div className="flex items-center gap-3">
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

function Leaders({ title, rows }: { title: string; rows: { label: string; n: number }[] }) {
  if (rows.length === 0) return null;
  const max = rows[0].n;
  return (
    <div className="space-y-3">
      <div className="text-xs font-mono text-zinc-400">{title}</div>
      {rows.map(r => <HBar key={r.label} label={r.label} value={r.n} max={max} />)}
    </div>
  );
}

export function AdminScreen({
  isAdmin,
  onSignIn,
  onSignOut,
  onClose,
}: {
  isAdmin: boolean;
  onSignIn: () => void;
  onSignOut: () => void;
  onClose: () => void;
}) {
  const [win, setWin] = useState<Win>('7d');
  const [tab, setTab] = useState<Tab>('overview');

  const [summary, setSummary] = useState<Summary | null>(null);
  const [series, setSeries] = useState<Point[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [funnels, setFunnels] = useState<Funnels | null>(null);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);

  const load = useCallback(async (w: Win) => {
    const [s, ts, f] = await Promise.all([
      fetch(`/api/admin/summary?window=${w}`).then(r => r.json()),
      fetch(`/api/admin/timeseries?window=${w}`).then(r => r.json()),
      fetch('/api/admin/feed').then(r => r.json()),
    ]);
    setSummary(s);
    setSeries(ts);
    setFeed(f);
  }, []);

  const loadUsers = useCallback(async (w: Win) => {
    setUsersData(await fetch(`/api/admin/users?window=${w}`).then(r => r.json()));
  }, []);

  const loadFunnels = useCallback(async (w: Win) => {
    setFunnels(await fetch(`/api/admin/funnels?window=${w}`).then(r => r.json()));
  }, []);

  // Overview + acquisition both read the summary endpoint.
  useEffect(() => {
    if (!isAdmin) return;
    if (tab === 'overview' || tab === 'acquisition') load(win);
    if (tab === 'users') loadUsers(win);
    if (tab === 'funnels') loadFunnels(win);
  }, [isAdmin, win, tab, load, loadUsers, loadFunnels]);

  useEffect(() => {
    if (!isAdmin) return;
    const t = setInterval(() => {
      if (tab === 'overview' || tab === 'acquisition') load(win);
      if (tab === 'users') loadUsers(win);
      if (tab === 'funnels') loadFunnels(win);
    }, 30_000);
    return () => clearInterval(t);
  }, [isAdmin, win, tab, load, loadUsers, loadFunnels]);

  useEffect(() => {
    if (!selectedUser) { setUserDetail(null); return; }
    fetch(`/api/admin/users/${selectedUser}`).then(r => r.json()).then(setUserDetail);
  }, [selectedUser]);

  const winLabel = win === '24h' ? '24 hours' : win === '7d' ? '7 days' : '30 days';

  return (
    <div
      className="absolute inset-0 overflow-y-auto bg-zinc-50 dark:bg-zinc-950"
      onClick={e => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="fixed top-6 left-6 z-10 text-sm font-mono text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors duration-200"
      >
        exit
      </button>
      <div className="flex flex-col px-8 pt-24 pb-24 max-w-xl mx-auto w-full space-y-12">
        {!isAdmin ? (
          <div className="flex flex-col gap-4 w-72 mx-auto pt-20 text-center">
            <p className="text-xs tracking-[0.2em] uppercase text-zinc-400">admin</p>
            <p className="text-sm text-zinc-400 dark:text-zinc-600">Sign in to access the dashboard.</p>
            <button
              onClick={onSignIn}
              className="rounded-full px-4 py-2 bg-zinc-900 dark:bg-zinc-50 text-zinc-50 dark:text-zinc-900 text-sm hover:opacity-80 transition-opacity"
            >
              Sign in with Google
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-mono tracking-widest text-zinc-400">zen</span>
              <div className="flex gap-4 items-center">
                <button
                  onClick={onSignOut}
                  className="text-xs font-mono text-zinc-300 dark:text-zinc-600 hover:text-red-400 transition-colors duration-200"
                >
                  logout
                </button>
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

            {/* tab bar */}
            <div className="flex gap-5 -mt-6">
              {(['overview', 'users', 'funnels', 'acquisition'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelectedUser(null); }}
                  className={`text-xs font-mono transition-colors duration-200 ${
                    tab === t
                      ? 'text-zinc-900 dark:text-zinc-100'
                      : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <Divider />

            {/* ---------- OVERVIEW ---------- */}
            {tab === 'overview' && (
              <>
                <div className="grid grid-cols-3 gap-8">
                  {[
                    { label: 'now',    sub: 'active',   value: summary ? String(summary.now) : '—' },
                    { label: 'today',  sub: 'sessions', value: summary ? fmt(summary.today) : '—' },
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
                      <Leaders title="countries" rows={summary.countries.map(r => ({ label: r.country, n: r.n }))} />
                      <div className="space-y-3">
                        <div className="text-xs font-mono text-zinc-400">referrers</div>
                        {summary.referrers.length === 0
                          ? <span className="text-xs text-zinc-400">direct</span>
                          : summary.referrers.map(r => (
                              <HBar key={r.referrer} label={r.referrer} value={r.n} max={summary.referrers[0].n} />
                            ))}
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
                          <span className="text-zinc-600 dark:text-zinc-300 truncate">{item.name.replace(/_/g, ' ')}</span>
                          {item.country && <span className="text-zinc-400">{item.country}</span>}
                          {item.device && <span className="text-zinc-300 dark:text-zinc-600">{item.device}</span>}
                          <span className="ml-auto text-zinc-300 dark:text-zinc-600 shrink-0">{ago(item.ts)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}

            {/* ---------- USERS ---------- */}
            {tab === 'users' && selectedUser && (
              <div className="space-y-6">
                <button
                  onClick={() => setSelectedUser(null)}
                  className="text-xs font-mono text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  ← back
                </button>
                {!userDetail ? (
                  <p className="text-xs text-zinc-400">loading…</p>
                ) : (
                  <>
                    <div className="space-y-1">
                      <div className="text-sm font-mono text-zinc-900 dark:text-zinc-100">
                        {(userDetail.profile?.email as string) ??
                          (userDetail.profile?.is_anonymous ? 'anonymous' : 'user')}
                      </div>
                      <div className="text-xs text-zinc-400 font-mono break-all">{selectedUser}</div>
                    </div>
                    <Divider />
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-zinc-400">sessions · {userDetail.sessions.length}</div>
                      {userDetail.sessions.slice(0, 10).map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-zinc-600 dark:text-zinc-300">{(s.country as string) ?? '—'}</span>
                          <span className="text-zinc-300 dark:text-zinc-600">{(s.device as string) ?? ''}</span>
                          <span className="text-zinc-400">{(s.language as string) ?? ''}</span>
                          <span className="ml-auto text-zinc-300 dark:text-zinc-600">{ago(s.started_at as string)}</span>
                        </div>
                      ))}
                    </div>
                    <Divider />
                    <div className="space-y-3">
                      <div className="text-xs font-mono text-zinc-400">recent events</div>
                      {userDetail.events.slice(0, 30).map((e, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs font-mono">
                          <span className="text-zinc-600 dark:text-zinc-300">{e.name.replace(/_/g, ' ')}</span>
                          <span className="ml-auto text-zinc-300 dark:text-zinc-600">{ago(e.ts)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {tab === 'users' && !selectedUser && (
              <>
                {usersData && (
                  <div className="grid grid-cols-4 gap-6">
                    {[
                      { label: 'total',      value: usersData.totals.total },
                      { label: 'registered', value: usersData.totals.registered },
                      { label: 'new today',  value: usersData.totals.new_today },
                      { label: 'returning',  value: usersData.returning },
                    ].map(({ label, value }) => (
                      <div key={label} className="space-y-1">
                        <div className="text-2xl font-light font-mono">{fmt(value)}</div>
                        <div className="text-xs text-zinc-400">{label}</div>
                      </div>
                    ))}
                  </div>
                )}
                <Divider />
                <div className="space-y-2">
                  <div className="text-xs font-mono text-zinc-400">users · {winLabel}</div>
                  {!usersData ? (
                    <p className="text-xs text-zinc-400">loading…</p>
                  ) : usersData.users.length === 0 ? (
                    <p className="text-xs text-zinc-400">no users yet</p>
                  ) : (
                    usersData.users.map(u => (
                      <button
                        key={u.user_id}
                        onClick={() => setSelectedUser(u.user_id)}
                        className="w-full flex items-center gap-3 text-xs font-mono py-1 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded px-1 transition-colors"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${u.is_anonymous ? 'bg-zinc-300 dark:bg-zinc-700' : 'bg-emerald-400'}`} />
                        <span className="text-zinc-600 dark:text-zinc-300 truncate text-left flex-1">
                          {u.email ?? u.user_id.slice(0, 8)}
                        </span>
                        <span className="text-zinc-400" title="sessions">{u.sessions}s</span>
                        <span className="text-zinc-400" title="words">{fmt(u.words)}w</span>
                        <span className="text-zinc-300 dark:text-zinc-600 shrink-0">{ago(u.last_seen)}</span>
                      </button>
                    ))
                  )}
                </div>
              </>
            )}

            {/* ---------- FUNNELS ---------- */}
            {tab === 'funnels' && (
              !funnels ? (
                <p className="text-xs text-zinc-400">loading…</p>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="text-xs font-mono text-zinc-400">conversion · {winLabel}</div>
                    {([
                      { label: 'visited',   value: funnels.funnel.visited },
                      { label: 'practiced', value: funnels.funnel.practiced },
                      { label: 'recorded',  value: funnels.funnel.recorded },
                    ]).map((step, i, arr) => {
                      const top = arr[0].value || 1;
                      const pct = Math.round((step.value / top) * 100);
                      return (
                        <div key={step.label} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-zinc-500">{step.label}</span>
                            <span className="text-zinc-900 dark:text-zinc-100">{fmt(step.value)} · {pct}%</span>
                          </div>
                          <div className="h-2 bg-zinc-100 dark:bg-zinc-900 rounded">
                            <div className="h-full bg-zinc-400 dark:bg-zinc-500 rounded transition-all duration-700" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <Divider />
                  <div className="grid grid-cols-2 gap-10">
                    <Leaders title="by mode" rows={funnels.by_mode.map(r => ({ label: r.mode, n: r.n }))} />
                    <Leaders title="by language" rows={funnels.by_language.map(r => ({ label: r.language, n: r.n }))} />
                  </div>
                  <Divider />
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-zinc-400">avg events / session</span>
                    <span className="text-xs font-mono text-zinc-900 dark:text-zinc-100">
                      {funnels.avg_events_per_session.toFixed(1)}
                    </span>
                  </div>
                </>
              )
            )}

            {/* ---------- ACQUISITION ---------- */}
            {tab === 'acquisition' && (
              !summary ? (
                <p className="text-xs text-zinc-400">loading…</p>
              ) : (
                <div className="space-y-12">
                  <div className="grid grid-cols-2 gap-10">
                    <Leaders title="referrers" rows={summary.referrers.map(r => ({ label: r.referrer, n: r.n }))} />
                    <Leaders title="utm sources" rows={summary.utm_sources.map(r => ({ label: r.utm_source, n: r.n }))} />
                  </div>
                  <Divider />
                  <div className="grid grid-cols-2 gap-10">
                    <Leaders title="countries" rows={summary.countries.map(r => ({ label: r.country, n: r.n }))} />
                    <Leaders title="devices" rows={summary.devices.map(r => ({ label: r.device, n: r.n }))} />
                  </div>
                  <Divider />
                  <div className="grid grid-cols-2 gap-10">
                    <Leaders title="browsers" rows={summary.browsers.map(r => ({ label: r.browser, n: r.n }))} />
                    <Leaders title="os" rows={summary.oses.map(r => ({ label: r.os, n: r.n }))} />
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
