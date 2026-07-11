'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';
import { readCache, writeCache } from '../../lib/statsCache';
import { BarList } from './BarList';
import { LineChart, Sparkline, type SeriesKey } from './charts';
import {
  eventColor,
  fmt,
  mkBars,
  relTs,
  rootVars,
  type BarItem,
  type ThemeMode,
} from './theme';

type Win = '24h' | '7d' | '30d' | 'all';
type Section = 'overview' | 'users' | 'funnels' | 'acquisition' | 'subscriptions';

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
  display_name: string | null;
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
  subscription: { provider: string; plan: string | null; status: string; current_period_end: string | null } | null;
}
interface SubRequest {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  plan: string;
  amount_cents: number;
  wallet: string | null;
  status: string;
  admin_note: string | null;
  reviewed_at: string | null;
  created_at: string;
  screenshot_url: string | null;
}
interface SubRow {
  user_id: string;
  email: string | null;
  display_name: string | null;
  provider: string;
  plan: string | null;
  status: string;
  current_period_end: string | null;
  updated_at: string;
}
interface SubsData {
  requests: SubRequest[];
  subscriptions: SubRow[];
}
type ReqStatus = 'pending' | 'approved' | 'rejected';

type SortKey = 'name' | 'sessions' | 'words' | 'recordings' | 'first_seen' | 'last_seen';

const WIN_LABEL: Record<Win, string> = { '24h': '24 hours', '7d': '7 days', '30d': '30 days', 'all': 'all time' };

function useIsNarrow(maxWidth = 860): boolean {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width:${maxWidth}px)`);
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, [maxWidth]);
  return narrow;
}

function fmtBucket(ts: string, win: Win): string {
  const d = new Date(ts);
  if (win === '24h') return String(d.getHours()).padStart(2, '0') + ':00';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** Best display label for a user: name, then email, then a short anonymous id. */
function userLabel(u: { display_name?: string | null; email?: string | null; user_id: string }): string {
  return u.display_name || u.email || 'anonymous · ' + u.user_id.slice(0, 8);
}

/** Fetch JSON, returning null on network error or non-OK response (never throws). */
async function getJSON<T>(url: string): Promise<T | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    return (await r.json()) as T;
  } catch {
    return null;
  }
}

/** POST JSON, returning whether the request succeeded (never throws). */
async function postJSON(url: string, body: unknown): Promise<boolean> {
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return r.ok;
  } catch {
    return false;
  }
}

function pctDelta(curr: number, prev: number): number | null {
  if (!prev) return null;
  return Math.round(((curr - prev) / prev) * 100);
}

function deltaChip(d: number | null): { text: string; style: CSSProperties } | null {
  if (d == null || !isFinite(d)) return null;
  const up = d >= 0;
  return {
    text: (up ? '↑ +' : '↓ ') + Math.abs(d) + '%',
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 3,
      fontFamily: 'var(--mono)',
      fontSize: 10.5,
      color: up ? 'var(--accent)' : '#ef4444',
      background: up ? 'var(--accent-dim)' : 'rgba(239,68,68,.12)',
      padding: '2px 7px',
      borderRadius: 6,
    },
  };
}

export function Dashboard({
  isAdmin,
  signIn,
  signOut,
  sansVar,
  monoVar,
}: {
  isAdmin: boolean;
  signIn: () => void;
  signOut: () => void;
  sansVar: string;
  monoVar: string;
}) {
  const narrow = useIsNarrow();
  const [theme, setTheme] = useState<ThemeMode>('dark');
  useEffect(() => {
    const saved = localStorage.getItem('adminTheme');
    if (saved === 'light' || saved === 'dark') setTheme(saved);
  }, []);
  const toggleTheme = () =>
    setTheme(t => {
      const next = t === 'dark' ? 'light' : 'dark';
      localStorage.setItem('adminTheme', next);
      return next;
    });

  const [section, setSection] = useState<Section>('overview');
  const [win, setWin] = useState<Win>('7d');
  const [series, setSeries] = useState<Record<SeriesKey, boolean>>({
    sessions: true,
    words: false,
    recordings: false,
  });
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({
    key: 'sessions',
    dir: 'desc',
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<number>(Date.now());
  const [loadError, setLoadError] = useState<string | null>(null);

  const [summary, setSummary] = useState<Summary | null>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [usersData, setUsersData] = useState<UsersData | null>(null);
  const [funnels, setFunnels] = useState<Funnels | null>(null);
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const [subsData, setSubsData] = useState<SubsData | null>(null);
  const [reqStatus, setReqStatus] = useState<ReqStatus>('pending');
  // id (request or user) with an in-flight approve/reject/grant/revoke call
  const [subBusy, setSubBusy] = useState<string | null>(null);
  const [detailTick, setDetailTick] = useState(0);
  // screenshot shown in the in-page lightbox (null = closed)
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!proofUrl) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setProofUrl(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [proofUrl]);

  // Hydrate from the last cached payload so a window/section switch paints
  // instantly, then the fetch below overwrites it with fresh data.
  const load = useCallback(async (w: Win) => {
    const cs = readCache<Summary>(`admin_summary_${w}`);
    const cts = readCache<Point[]>(`admin_points_${w}`);
    const cf = readCache<FeedItem[]>('admin_feed');
    if (cs) setSummary(cs);
    if (cts) setPoints(cts);
    if (cf) setFeed(cf);

    const [s, ts, f] = await Promise.all([
      getJSON<Summary>(`/api/admin/summary?window=${w}`),
      getJSON<Point[]>(`/api/admin/timeseries?window=${w}`),
      getJSON<FeedItem[]>('/api/admin/feed'),
    ]);
    if (s) { setSummary(s); writeCache(`admin_summary_${w}`, s); }
    if (ts) { const arr = Array.isArray(ts) ? ts : []; setPoints(arr); writeCache(`admin_points_${w}`, arr); }
    if (f) { const arr = Array.isArray(f) ? f : []; setFeed(arr); writeCache('admin_feed', arr); }
    setLoadError(s && ts && f ? null : 'Some data failed to load — retrying on next refresh.');
    setRefreshedAt(Date.now());
  }, []);
  const loadUsers = useCallback(async (w: Win) => {
    const cu = readCache<UsersData>(`admin_users_${w}`);
    if (cu) setUsersData(cu);
    const u = await getJSON<UsersData>(`/api/admin/users?window=${w}`);
    if (u) { setUsersData(u); writeCache(`admin_users_${w}`, u); }
    setLoadError(u ? null : 'Users failed to load — retrying on next refresh.');
    setRefreshedAt(Date.now());
  }, []);
  const loadFunnels = useCallback(async (w: Win) => {
    const cfn = readCache<Funnels>(`admin_funnels_${w}`);
    if (cfn) setFunnels(cfn);
    const fn = await getJSON<Funnels>(`/api/admin/funnels?window=${w}`);
    if (fn) { setFunnels(fn); writeCache(`admin_funnels_${w}`, fn); }
    setLoadError(fn ? null : 'Funnels failed to load — retrying on next refresh.');
    setRefreshedAt(Date.now());
  }, []);
  const loadSubs = useCallback(async (status: ReqStatus) => {
    const c = readCache<SubsData>(`admin_subs_${status}`);
    if (c) setSubsData(c);
    const d = await getJSON<SubsData>(`/api/admin/subscriptions?status=${status}`);
    if (d) { setSubsData(d); writeCache(`admin_subs_${status}`, d); }
    setLoadError(d ? null : 'Subscriptions failed to load — retrying on next refresh.');
    setRefreshedAt(Date.now());
  }, []);

  const refresh = useCallback(() => {
    if (!isAdmin) return;
    if (section === 'overview' || section === 'acquisition') load(win);
    if (section === 'users') loadUsers(win);
    if (section === 'funnels') loadFunnels(win);
    if (section === 'subscriptions') loadSubs(reqStatus);
  }, [isAdmin, section, win, reqStatus, load, loadUsers, loadFunnels, loadSubs]);

  const reviewRequest = useCallback(async (id: string, action: 'approve' | 'reject') => {
    setSubBusy(id);
    const ok = await postJSON('/api/admin/subscriptions/review', { requestId: id, action });
    if (!ok) setLoadError('Review action failed — try again.');
    await loadSubs(reqStatus);
    setSubBusy(null);
  }, [loadSubs, reqStatus]);

  const manageSub = useCallback(async (userId: string, action: 'grant' | 'revoke', plan?: 'monthly' | 'yearly') => {
    setSubBusy(userId);
    const ok = await postJSON('/api/admin/subscriptions/manage', { userId, action, plan });
    if (!ok) setLoadError('Subscription update failed — try again.');
    if (section === 'subscriptions') await loadSubs(reqStatus);
    setDetailTick(t => t + 1); // refresh the user detail panel's subscription block
    setSubBusy(null);
  }, [section, loadSubs, reqStatus]);

  useEffect(() => { refresh(); }, [refresh]);
  useEffect(() => {
    if (!isAdmin) return;
    const t = setInterval(refresh, 30_000);
    return () => clearInterval(t);
  }, [isAdmin, refresh]);

  useEffect(() => {
    if (!selectedUser) { setUserDetail(null); return; }
    let active = true;
    getJSON<UserDetail>(`/api/admin/users/${selectedUser}`).then(d => {
      if (active && d) setUserDetail(d);
    });
    return () => { active = false; };
  }, [selectedUser, detailTick]);

  const root = useMemo(
    () => ({
      ...rootVars(theme, sansVar, monoVar),
      fontFamily: 'var(--sans)',
      background: 'var(--bg)',
      color: 'var(--text)',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column' as const,
      WebkitFontSmoothing: 'antialiased' as const,
    }),
    [theme, sansVar, monoVar],
  );

  // ---------- signed-out / non-admin ----------
  if (!isAdmin) {
    return (
      <div style={root}>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <div style={{ textAlign: 'center', maxWidth: 340 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, marginBottom: 30 }}>
              <div style={{ width: 11, height: 11, borderRadius: 3, background: 'var(--accent)' }} />
              <span style={{ fontWeight: 600, fontSize: 18, letterSpacing: '-.01em' }}>Faseeh</span>
              <span style={badgeStyle}>admin</span>
            </div>
            <h1 style={{ fontSize: 22, fontWeight: 600, margin: '0 0 10px', letterSpacing: '-.02em' }}>
              Admin console
            </h1>
            <p style={{ color: 'var(--dim)', fontSize: 14, lineHeight: 1.6, margin: '0 0 28px' }}>
              Restricted to the product owner. Sign in to view analytics.
            </p>
            <button onClick={signIn} style={signInBtn}>
              <span style={{ width: 15, height: 15, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
              Sign in with Google
            </button>
            <div style={{ marginTop: 18, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)' }}>
              one authorized account
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------- derived data ----------
  const allSessions = points.map(p => p.sessions);
  const tail = allSessions.slice(-14);
  const sActive = (Object.keys(series) as SeriesKey[]).filter(k => series[k]);
  let peak = 1;
  points.forEach(b => sActive.forEach(k => { if (b[k] > peak) peak = b[k]; }));

  const todayDelta =
    points.length >= 2
      ? deltaChip(pctDelta(points[points.length - 1].sessions, points[points.length - 2].sessions))
      : null;
  const half = Math.floor(points.length / 2);
  const firstHalf = points.slice(0, half).reduce((a, b) => a + b.sessions, 0);
  const secondHalf = points.slice(half).reduce((a, b) => a + b.sessions, 0);
  const periodDelta = half > 0 ? deltaChip(pctDelta(secondHalf, firstHalf)) : null;

  const feedRows = feed.slice(0, 11).map(e => ({
    name: e.name,
    meta: [e.country, e.device].filter(Boolean).join(' · ') || '—',
    rel: relTs(e.ts),
    dotColor: eventColor(e.name),
  }));

  const tot = usersData?.totals;
  const ago = Math.round((Date.now() - refreshedAt) / 1000);
  const refreshLabel = ago < 2 ? 'refreshing…' : `updated ${ago}s ago`;

  // user table
  const sortedUsers = (usersData?.users ?? []).slice().sort((a, b) => {
    const dir = sort.dir === 'desc' ? -1 : 1;
    if (sort.key === 'name') {
      const av = a.display_name ?? a.email ?? 'z' + a.user_id;
      const bv = b.display_name ?? b.email ?? 'z' + b.user_id;
      return dir * av.localeCompare(bv);
    }
    if (sort.key === 'first_seen' || sort.key === 'last_seen') {
      return dir * (new Date(a[sort.key]).getTime() - new Date(b[sort.key]).getTime());
    }
    return dir * ((a[sort.key] as number) - (b[sort.key] as number));
  });
  const selRow = (usersData?.users ?? []).find(u => u.user_id === selectedUser) ?? null;
  const hasDetail = section === 'users' && !!selectedUser;

  const fn = funnels?.funnel;
  const funnelSteps = fn
    ? [
        { label: 'Visited', n: fn.visited, prev: 0 },
        { label: 'Practiced', n: fn.practiced, prev: fn.visited },
        { label: 'Recorded', n: fn.recorded, prev: fn.practiced },
      ].map(s => ({
        label: s.label,
        nFmt: fmt(s.n),
        width: Math.max(3, Math.round((s.n / (fn.visited || 1)) * 100)) + '%',
        pctLabel: Math.round((s.n / (fn.visited || 1)) * 100) + '% of visits',
        conv: s.prev ? Math.round((s.n / s.prev) * 100) + '% step conversion' : '',
      }))
    : [];

  const barsFor = (
    list: { n: number }[] | undefined,
    key: string,
  ): BarItem[] =>
    mkBars((list ?? []).map(r => ({ label: String((r as Record<string, unknown>)[key] ?? '—'), n: r.n })));

  const pendingCount = subsData && reqStatus === 'pending' ? subsData.requests.length : null;

  const navDef: { k: Section; label: string; count?: string }[] = [
    { k: 'overview', label: 'Overview' },
    { k: 'users', label: 'Users', count: tot ? fmt(tot.total) : undefined },
    { k: 'subscriptions', label: 'Subscriptions', count: pendingCount ? String(pendingCount) : undefined },
    { k: 'funnels', label: 'Funnels' },
    { k: 'acquisition', label: 'Acquisition' },
  ];
  const titleMap: Record<Section, string> = {
    overview: 'Overview',
    users: 'Users',
    subscriptions: 'Subscriptions',
    funnels: 'Funnels',
    acquisition: 'Acquisition',
  };
  const capMap: Record<Section, string> = {
    overview: `live pulse · ${win}`,
    users: tot ? `${fmt(tot.total)} users · ${fmt(tot.registered)} registered` : '',
    subscriptions: 'manual payments · InstaPay / Vodafone Cash',
    funnels: `window ${win}`,
    acquisition: `window ${win}`,
  };

  const grid = (cols: number): CSSProperties => ({
    display: 'grid',
    gridTemplateColumns: narrow ? '1fr' : `repeat(${cols},1fr)`,
    gap: 14,
  });

  // ---------- signed-in ----------
  return (
    <div style={root}>
      <div style={centerWrap}>
      <header style={headerStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 9, height: 9, borderRadius: 2, background: 'var(--accent)' }} />
          <a href="/" style={{ fontWeight: 600, fontSize: 15, letterSpacing: '-.01em', color: 'inherit', textDecoration: 'none', cursor: 'pointer' }}>Faseeh</a>
          {!narrow && <span style={badgeStyle}>admin</span>}
        </div>
        <div style={{ flex: 1 }} />
        <div style={winSelectorStyle}>
          {(['24h', '7d', '30d', 'all'] as Win[]).map(k => {
            const active = win === k;
            return (
              <button key={k} onClick={() => setWin(k)} style={winBtn(active)}>
                {k}
              </button>
            );
          })}
        </div>
        {!narrow && (
          <div style={liveStyle}>
            <span style={pulseDot(7)} />
            <span style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>
              {summary ? summary.now : '–'}
            </span>
            <span>live</span>
            <span style={{ color: 'var(--border)' }}>·</span>
            <span style={{ color: 'var(--faint)' }}>{refreshLabel}</span>
          </div>
        )}
        <button onClick={toggleTheme} style={iconBtn} title="Toggle theme">
          {theme === 'dark' ? '☾' : '☀'}
        </button>
        <button onClick={signOut} style={textBtn}>
          sign out
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', alignItems: 'stretch', flex: 1 }}>
        {/* nav */}
        {narrow ? (
          <nav style={topNavStyle}>
            {navDef.map(item => {
              const active = section === item.k;
              return (
                <button
                  key={item.k}
                  onClick={() => { setSection(item.k); setSelectedUser(null); }}
                  style={topNavBtn(active)}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>
        ) : (
          <nav style={sideNavStyle}>
            <div style={{ position: 'sticky', top: 53 }}>
              {navDef.map(item => {
                const active = section === item.k;
                return (
                  <button
                    key={item.k}
                    onClick={() => { setSection(item.k); setSelectedUser(null); }}
                    style={sideNavBtn(active)}
                  >
                    <span>{item.label}</span>
                    {item.count ? (
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)' }}>
                        {item.count}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </nav>
        )}

        <main style={{ flex: 1, minWidth: 0, width: '100%', padding: narrow ? '18px 16px 64px' : '24px 28px 72px' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 18 }}>
            <h2 style={{ fontSize: 17, fontWeight: 600, letterSpacing: '-.01em', margin: 0 }}>
              {titleMap[section]}
            </h2>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>
              {capMap[section]}
            </span>
          </div>

          {loadError && (
            <div
              style={{
                marginBottom: 14,
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid rgba(239,68,68,.3)',
                background: 'rgba(239,68,68,.08)',
                color: '#ef4444',
                fontFamily: 'var(--mono)',
                fontSize: 11.5,
              }}
            >
              {loadError}
            </div>
          )}

          {/* ---------- OVERVIEW ---------- */}
          {section === 'overview' && (
            <div>
              <div style={{ ...grid(3), marginBottom: 14 }}>
                <KpiTile
                  label="active now"
                  value={summary ? String(summary.now) : '–'}
                  chip={{ text: 'live', live: true }}
                  spark={<Sparkline values={tail} color="var(--accent)" />}
                />
                <KpiTile
                  label="sessions today"
                  value={summary ? fmt(summary.today) : '–'}
                  delta={todayDelta}
                  spark={<Sparkline values={tail} color="var(--dim)" />}
                />
                <KpiTile
                  label={`sessions · ${win}`}
                  value={summary ? fmt(summary.period) : '–'}
                  delta={periodDelta}
                  spark={<Sparkline values={allSessions} color="var(--dim)" />}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : 'repeat(3,1fr)', gap: 14, marginBottom: 14 }}>
                <div style={{ ...panel, gridColumn: narrow ? 'auto' : 'span 2', minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
                    <div>
                      <span style={kicker}>activity over time</span>
                      <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)', marginLeft: 10 }}>
                        peak {fmt(peak)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(
                        [
                          ['sessions', 'sessions', 'var(--accent)'],
                          ['words', 'words', 'var(--text)'],
                          ['recordings', 'recordings', 'var(--faint)'],
                        ] as [SeriesKey, string, string][]
                      ).map(([k, label, color]) => {
                        const on = series[k];
                        return (
                          <button
                            key={k}
                            onClick={() =>
                              setSeries(s => {
                                const ns = { ...s, [k]: !s[k] };
                                if (!ns.sessions && !ns.words && !ns.recordings) ns[k] = true;
                                return ns;
                              })
                            }
                            style={seriesChip(on)}
                          >
                            <span style={{ width: 7, height: 7, borderRadius: 2, display: 'inline-block', background: on ? color : 'var(--bar)' }} />
                            {label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div style={{ flex: 1, minHeight: 230 }}>
                    <LineChart buckets={points} series={series} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)', padding: '0 2px', marginTop: 2 }}>
                    <span>{points[0] ? fmtBucket(points[0].bucket, win) : ''}</span>
                    <span>{points.length ? fmtBucket(points[Math.floor((points.length - 1) / 2)].bucket, win) : ''}</span>
                    <span>{points.length ? fmtBucket(points[points.length - 1].bucket, win) : ''}</span>
                  </div>
                </div>

                <div style={{ ...panel, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <span style={kicker}>live feed</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)' }}>
                      <span style={pulseDot(5)} />
                      streaming
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {feedRows.map((e, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', flex: 'none', background: e.dotColor }} />
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>{e.name}</span>
                        <span style={{ flex: 1 }} />
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)', whiteSpace: 'nowrap' }}>{e.meta}</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--dim)', width: 26, textAlign: 'right' }}>{e.rel}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={grid(3)}>
                <BarList title="Events" caption={win} items={barsFor(summary?.events, 'name')} minHeight={300} />
                <BarList title="Geography" caption="sessions" items={barsFor(summary?.countries, 'country')} minHeight={300} />
                <BarList title="Referrers" caption="sessions" items={barsFor(summary?.referrers, 'referrer')} minHeight={300} />
              </div>
            </div>
          )}

          {/* ---------- USERS ---------- */}
          {section === 'users' && (
            <div>
              <div style={{ ...grid(5), marginBottom: 14 }}>
                {[
                  { label: 'total', value: tot ? fmt(tot.total) : '–', sub: 'all-time' },
                  { label: 'registered', value: tot ? fmt(tot.registered) : '–', sub: tot ? Math.round((tot.registered / (tot.total || 1)) * 100) + '% of users' : '' },
                  { label: 'anonymous', value: tot ? fmt(tot.anonymous) : '–', sub: tot ? Math.round((tot.anonymous / (tot.total || 1)) * 100) + '% of users' : '' },
                  { label: 'new today', value: tot ? fmt(tot.new_today) : '–', sub: 'first seen' },
                  { label: `returning · ${win}`, value: usersData ? fmt(usersData.returning) : '–', sub: '' },
                ].map(t => (
                  <div key={t.label} style={{ ...panel, padding: 16 }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>{t.label}</span>
                    <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-.02em', marginTop: 10, fontVariantNumeric: 'tabular-nums' }}>{t.value}</div>
                    {t.sub ? <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)' }}>{t.sub}</span> : null}
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', flexDirection: narrow ? 'column' : 'row', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ flex: hasDetail && !narrow ? 1.6 : 1, minWidth: 0, width: '100%', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: 640 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: ROW_COLS, gap: 8, padding: '12px 18px', borderBottom: '1px solid var(--border)' }}>
                        {(
                          [
                            ['name', 'user', 'left'],
                            ['sessions', 'sessions', 'right'],
                            ['words', 'words', 'right'],
                            ['recordings', 'recs', 'right'],
                            ['first_seen', 'first seen', 'right'],
                            ['last_seen', 'last seen', 'right'],
                          ] as [SortKey, string, 'left' | 'right'][]
                        ).map(([k, label, align]) => {
                          const active = sort.key === k;
                          const arrow = active ? (sort.dir === 'desc' ? ' ↓' : ' ↑') : '';
                          return (
                            <button
                              key={k}
                              onClick={() => setSort(s => ({ key: k, dir: s.key === k ? (s.dir === 'desc' ? 'asc' : 'desc') : 'desc' }))}
                              style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: active ? 'var(--text)' : 'var(--faint)', cursor: 'pointer', textAlign: align }}
                            >
                              {label + arrow}
                            </button>
                          );
                        })}
                      </div>
                      {sortedUsers.map(u => (
                        <div
                          key={u.user_id}
                          onClick={() => setSelectedUser(u.user_id)}
                          style={{ display: 'grid', gridTemplateColumns: ROW_COLS, gap: 8, padding: '12px 18px', borderBottom: '1px solid var(--border)', cursor: 'pointer', alignItems: 'center' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 9, minWidth: 0 }}>
                            <span style={{ width: 7, height: 7, borderRadius: '50%', flex: 'none', background: u.is_anonymous ? 'var(--bar)' : 'var(--accent)' }} />
                            <span style={{ minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                              <span style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {userLabel(u)}
                              </span>
                              {u.display_name && u.email ? (
                                <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                  {u.email}
                                </span>
                              ) : null}
                            </span>
                            {u.returning ? <span style={returnBadge}>return</span> : null}
                          </div>
                          <span style={numCell('var(--text)')}>{u.sessions}</span>
                          <span style={numCell('var(--dim)')}>{fmt(u.words)}</span>
                          <span style={numCell('var(--dim)')}>{u.recordings}</span>
                          <span style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--faint)' }}>{relTs(u.first_seen)}</span>
                          <span style={{ textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--faint)' }}>{relTs(u.last_seen)}</span>
                        </div>
                      ))}
                      {usersData && sortedUsers.length === 0 && (
                        <div style={{ padding: '18px', fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>no users yet</div>
                      )}
                    </div>
                  </div>
                </div>

                {hasDetail && (
                  <div style={{ flex: 1, minWidth: 0, width: '100%', ...panel, position: narrow ? 'static' : 'sticky', top: 72 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', flex: 'none', background: selRow && !selRow.is_anonymous ? 'var(--accent)' : 'var(--bar)' }} />
                          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {selRow ? userLabel(selRow) : 'anonymous user'}
                          </span>
                        </div>
                        {selRow?.display_name && selRow?.email ? (
                          <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', marginTop: 5, wordBreak: 'break-all' }}>{selRow.email}</div>
                        ) : null}
                        <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)', marginTop: 5, wordBreak: 'break-all' }}>{selectedUser}</div>
                      </div>
                      <button onClick={() => setSelectedUser(null)} style={closeBtn}>close</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, padding: '14px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
                      {[
                        { v: selRow?.sessions ?? 0, l: 'sessions' },
                        { v: selRow?.words ?? 0, l: 'words' },
                        { v: selRow?.recordings ?? 0, l: 'recordings' },
                      ].map(s => (
                        <div key={s.l}>
                          <div style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{fmt(s.v)}</div>
                          <span style={detailKicker}>{s.l}</span>
                        </div>
                      ))}
                    </div>
                    <div style={detailSectionLabel}>subscription</div>
                    {(() => {
                      const ds = userDetail?.subscription ?? null;
                      const active = !!ds && ds.status === 'active' && !!ds.current_period_end && new Date(ds.current_period_end) > new Date();
                      const busy = subBusy === selectedUser;
                      return (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: active ? 'var(--accent)' : 'var(--dim)' }}>
                            {!userDetail
                              ? 'loading…'
                              : ds
                                ? `${active ? 'active' : ds.status}${ds.plan ? ' · ' + ds.plan : ''}${ds.current_period_end ? ' · until ' + new Date(ds.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}`
                                : 'none'}
                          </span>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button disabled={busy} onClick={() => selectedUser && manageSub(selectedUser, 'grant', 'monthly')} style={actionBtn('approve', busy)}>
                              +1 mo
                            </button>
                            <button disabled={busy} onClick={() => selectedUser && manageSub(selectedUser, 'grant', 'yearly')} style={actionBtn('approve', busy)}>
                              +1 yr
                            </button>
                            {active && (
                              <button disabled={busy} onClick={() => selectedUser && manageSub(selectedUser, 'revoke')} style={actionBtn('reject', busy)}>
                                revoke
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                    <div style={detailSectionLabel}>session history</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(userDetail?.sessions ?? []).slice(0, 8).map((h, i) => (
                        <div key={i} style={detailRow}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--dim)' }}>
                            {[h.country, h.device, h.language].filter(Boolean).join(' · ') || '—'}
                          </span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>
                            {h.started_at ? relTs(h.started_at as string) + ' ago' : ''}
                          </span>
                        </div>
                      ))}
                      {!userDetail && <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>loading…</span>}
                    </div>
                    <div style={detailSectionLabel}>recent events</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {(userDetail?.events ?? []).slice(0, 10).map((ev, i) => (
                        <div key={i} style={detailRow}>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--text)' }}>{ev.name}</span>
                          <span style={{ display: 'flex', gap: 10 }}>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>{ev.language ?? ''}</span>
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--dim)', width: 26, textAlign: 'right' }}>{relTs(ev.ts)}</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ---------- SUBSCRIPTIONS ---------- */}
          {section === 'subscriptions' && (
            <div>
              <div style={{ ...panel, padding: 0, overflow: 'hidden', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <span style={kicker}>payment requests</span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {(['pending', 'approved', 'rejected'] as ReqStatus[]).map(st => (
                      <button key={st} onClick={() => { setReqStatus(st); loadSubs(st); }} style={seriesChip(reqStatus === st)}>
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 760 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: REQ_COLS, gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                      {['user', 'plan', 'wallet', 'requested', 'proof', ''].map((h, i) => (
                        <span key={i} style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>{h}</span>
                      ))}
                    </div>
                    {(subsData?.requests ?? []).map(r => {
                      const busy = subBusy === r.id;
                      return (
                        <div key={r.id} style={{ display: 'grid', gridTemplateColumns: REQ_COLS, gap: 10, padding: '11px 18px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {r.email ?? 'anonymous · ' + r.user_id.slice(0, 8)}
                            </div>
                            {r.display_name ? (
                              <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.display_name}</div>
                            ) : null}
                          </div>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--text)' }}>
                            {r.plan}
                            <span style={{ color: 'var(--faint)' }}> · EGP {Math.round(r.amount_cents / 100)}</span>
                          </span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--dim)' }}>
                            {r.wallet === 'instapay' ? 'InstaPay' : r.wallet === 'vodafone_cash' ? 'Vodafone Cash' : '—'}
                          </span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--faint)' }}>{relTs(r.created_at)} ago</span>
                          {r.screenshot_url ? (
                            <button
                              type="button"
                              onClick={() => setProofUrl(r.screenshot_url)}
                              title="View screenshot"
                              style={{ padding: 0, border: 'none', background: 'none', cursor: 'zoom-in', display: 'block', lineHeight: 0 }}
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={r.screenshot_url} alt="payment proof" style={{ height: 38, width: 58, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border)', display: 'block' }} />
                            </button>
                          ) : (
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>—</span>
                          )}
                          {r.status === 'pending' ? (
                            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                              <button disabled={busy} onClick={() => reviewRequest(r.id, 'approve')} style={actionBtn('approve', busy)}>
                                {busy ? '…' : 'approve'}
                              </button>
                              <button disabled={busy} onClick={() => reviewRequest(r.id, 'reject')} style={actionBtn('reject', busy)}>
                                reject
                              </button>
                            </div>
                          ) : (
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: r.status === 'approved' ? 'var(--accent)' : '#ef4444', textAlign: 'right' }}>
                              {r.status}{r.reviewed_at ? ' · ' + relTs(r.reviewed_at) + ' ago' : ''}
                            </span>
                          )}
                        </div>
                      );
                    })}
                    {subsData && subsData.requests.length === 0 && (
                      <div style={{ padding: 18, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>no {reqStatus} requests</div>
                    )}
                    {!subsData && (
                      <div style={{ padding: 18, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>loading…</div>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ ...panel, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <span style={kicker}>subscriptions</span>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ minWidth: 720 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: SUB_COLS, gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--border)' }}>
                      {['user', 'plan', 'status', 'ends', 'provider', ''].map((h, i) => (
                        <span key={i} style={{ fontFamily: 'var(--mono)', fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--faint)' }}>{h}</span>
                      ))}
                    </div>
                    {(subsData?.subscriptions ?? []).map(s => {
                      const busy = subBusy === s.user_id;
                      const active = s.status === 'active' && !!s.current_period_end && new Date(s.current_period_end) > new Date();
                      return (
                        <div key={s.user_id} style={{ display: 'grid', gridTemplateColumns: SUB_COLS, gap: 10, padding: '11px 18px', borderBottom: '1px solid var(--border)', alignItems: 'center' }}>
                          <span style={{ fontSize: 13, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {s.email ?? 'anonymous · ' + s.user_id.slice(0, 8)}
                          </span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--dim)' }}>{s.plan ?? '—'}</span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: active ? 'var(--accent)' : 'var(--faint)' }}>
                            {active ? 'active' : s.status}
                          </span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--dim)' }}>
                            {s.current_period_end
                              ? new Date(s.current_period_end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                              : '—'}
                          </span>
                          <span style={{ fontFamily: 'var(--mono)', fontSize: 11.5, color: 'var(--faint)' }}>{s.provider}</span>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            {active ? (
                              <button disabled={busy} onClick={() => manageSub(s.user_id, 'revoke')} style={actionBtn('reject', busy)}>
                                {busy ? '…' : 'revoke'}
                              </button>
                            ) : (
                              <button disabled={busy} onClick={() => manageSub(s.user_id, 'grant', s.plan === 'yearly' ? 'yearly' : 'monthly')} style={actionBtn('approve', busy)}>
                                {busy ? '…' : 'grant'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {subsData && subsData.subscriptions.length === 0 && (
                      <div style={{ padding: 18, fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>no subscriptions yet</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ---------- FUNNELS ---------- */}
          {section === 'funnels' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: narrow ? '1fr' : '1.5fr 1fr', gap: 14 }}>
                <div style={{ ...panel, padding: '20px 20px 24px' }}>
                  <span style={kicker}>conversion funnel</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 20 }}>
                    {funnelSteps.map(s => (
                      <div key={s.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                          <span style={{ fontSize: 14, color: 'var(--text)' }}>{s.label}</span>
                          <span>
                            <span style={{ fontSize: 18, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{s.nFmt}</span>{' '}
                            <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--faint)' }}>{s.pctLabel}</span>
                          </span>
                        </div>
                        <div style={{ height: 32, background: 'var(--grid)', borderRadius: 6, overflow: 'hidden' }}>
                          <div style={{ height: '100%', background: 'var(--accent-dim)', borderLeft: '2px solid var(--accent)', width: s.width }} />
                        </div>
                        {s.conv ? <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--faint)', marginTop: 6 }}>{s.conv}</div> : null}
                      </div>
                    ))}
                    {funnelSteps.length === 0 && <span style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--faint)' }}>loading…</span>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ ...panel, display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 'none' }}>
                    <span style={kicker}>avg events / session</span>
                    <div style={{ fontSize: 40, fontWeight: 600, letterSpacing: '-.02em', marginTop: 8, fontVariantNumeric: 'tabular-nums' }}>
                      {funnels ? funnels.avg_events_per_session.toFixed(1) : '–'}
                    </div>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--faint)', marginTop: 6 }}>engagement depth · {win}</span>
                  </div>
                  <BarList title="By language" caption="usage" items={barsFor(funnels?.by_language, 'language')} minHeight={160} />
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <BarList title="By mode" caption={`generated · ${win}`} items={barsFor(funnels?.by_mode, 'mode')} minHeight={180} />
              </div>
            </div>
          )}

          {/* ---------- ACQUISITION ---------- */}
          {section === 'acquisition' && (
            <div style={grid(3)}>
              <BarList title="Referrers" caption={win} items={barsFor(summary?.referrers, 'referrer')} minHeight={260} />
              <BarList title="UTM sources" caption={win} items={barsFor(summary?.utm_sources, 'utm_source')} minHeight={260} />
              <BarList title="Countries" caption={win} items={barsFor(summary?.countries, 'country')} minHeight={260} />
              <BarList title="Devices" caption={win} items={barsFor(summary?.devices, 'device')} minHeight={260} />
              <BarList title="Browsers" caption={win} items={barsFor(summary?.browsers, 'browser')} minHeight={260} />
              <BarList title="Operating systems" caption={win} items={barsFor(summary?.oses, 'os')} minHeight={260} />
            </div>
          )}
        </main>
      </div>
      </div>

      {proofUrl && (
        <div
          onClick={() => setProofUrl(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 24,
            background: 'rgba(0,0,0,.8)',
            backdropFilter: 'blur(2px)',
            cursor: 'zoom-out',
          }}
        >
          <button
            type="button"
            onClick={() => setProofUrl(null)}
            aria-label="Close"
            style={{
              position: 'absolute',
              top: 18,
              right: 20,
              width: 34,
              height: 34,
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'rgba(0,0,0,.4)',
              color: 'var(--text)',
              cursor: 'pointer',
              fontSize: 18,
              lineHeight: 1,
            }}
          >
            ×
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={proofUrl}
            alt="payment proof"
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, cursor: 'zoom-out', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}
          />
        </div>
      )}
    </div>
  );
}

const ROW_COLS = '2.2fr .8fr .8fr .7fr 1fr 1fr';
const REQ_COLS = '1.8fr 1fr .9fr .8fr .7fr 1.2fr';
const SUB_COLS = '1.8fr .8fr .8fr 1fr .8fr .8fr';

function actionBtn(kind: 'approve' | 'reject', disabled: boolean): CSSProperties {
  const danger = kind === 'reject';
  return {
    fontFamily: 'var(--mono)',
    fontSize: 11,
    padding: '5px 10px',
    borderRadius: 7,
    border: `1px solid ${danger ? 'rgba(239,68,68,.4)' : 'var(--accent)'}`,
    background: danger ? 'transparent' : 'var(--accent-dim)',
    color: danger ? '#ef4444' : 'var(--accent)',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? 0.5 : 1,
    whiteSpace: 'nowrap',
    flex: 'none',
  };
}

function KpiTile({
  label,
  value,
  delta,
  chip,
  spark,
}: {
  label: string;
  value: string;
  delta?: { text: string; style: CSSProperties } | null;
  chip?: { text: string; live?: boolean };
  spark: React.ReactNode;
}) {
  return (
    <div style={panel}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={kicker}>{label}</span>
        {chip ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--accent)' }}>
            {chip.live && <span style={pulseDot(6)} />}
            {chip.text}
          </span>
        ) : delta ? (
          <span style={delta.style}>{delta.text}</span>
        ) : null}
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, marginTop: 14 }}>
        <span style={{ fontSize: 34, fontWeight: 600, letterSpacing: '-.02em', lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{value}</span>
        <div style={{ width: 90, height: 30, flex: 'none' }}>{spark}</div>
      </div>
    </div>
  );
}

// ---------- shared inline styles ----------
const panel: CSSProperties = {
  background: 'var(--panel)',
  border: '1px solid var(--border)',
  borderRadius: 10,
  padding: 18,
};
const kicker: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 11,
  letterSpacing: '.07em',
  textTransform: 'uppercase',
  color: 'var(--faint)',
};
const badgeStyle: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 10,
  letterSpacing: '.12em',
  textTransform: 'uppercase',
  color: 'var(--faint)',
  border: '1px solid var(--border)',
  padding: '2px 6px',
  borderRadius: 5,
};
const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '13px 22px',
  borderBottom: '1px solid var(--border)',
  position: 'sticky',
  top: 0,
  zIndex: 20,
  background: 'var(--bg)',
};
const winSelectorStyle: CSSProperties = {
  display: 'flex',
  gap: 2,
  padding: 3,
  background: 'var(--elev)',
  border: '1px solid var(--border)',
  borderRadius: 9,
};
const liveStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  fontFamily: 'var(--mono)',
  fontSize: 11,
  color: 'var(--dim)',
};
const centerWrap: CSSProperties = {
  width: '100%',
  maxWidth: 1320,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
};
const sideNavStyle: CSSProperties = {
  width: 206,
  flex: 'none',
  borderRight: '1px solid var(--border)',
  padding: '18px 14px',
  alignSelf: 'stretch',
};
const topNavStyle: CSSProperties = {
  display: 'flex',
  gap: 4,
  width: '100%',
  padding: '10px 12px',
  borderBottom: '1px solid var(--border)',
  overflowX: 'auto',
};
const textBtn: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 11,
  color: 'var(--faint)',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 2px',
};
const iconBtn: CSSProperties = {
  fontSize: 13,
  color: 'var(--dim)',
  background: 'var(--elev)',
  border: '1px solid var(--border)',
  borderRadius: 7,
  cursor: 'pointer',
  padding: '4px 8px',
  lineHeight: 1,
};
const signInBtn: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 10,
  background: 'var(--text)',
  color: 'var(--bg)',
  border: 'none',
  borderRadius: 9,
  padding: '11px 18px',
  fontSize: 14,
  fontWeight: 500,
  cursor: 'pointer',
  fontFamily: 'var(--sans)',
};
const returnBadge: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 9,
  letterSpacing: '.04em',
  textTransform: 'uppercase',
  color: 'var(--faint)',
  border: '1px solid var(--border)',
  padding: '1px 5px',
  borderRadius: 4,
  flex: 'none',
};
const closeBtn: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 11,
  color: 'var(--faint)',
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '4px 8px',
  cursor: 'pointer',
};
const detailKicker: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 9.5,
  textTransform: 'uppercase',
  letterSpacing: '.05em',
  color: 'var(--faint)',
};
const detailSectionLabel: CSSProperties = {
  fontFamily: 'var(--mono)',
  fontSize: 10,
  letterSpacing: '.06em',
  textTransform: 'uppercase',
  color: 'var(--faint)',
  margin: '18px 0 10px',
};
const detailRow: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '7px 0',
  borderBottom: '1px solid var(--border)',
};

function numCell(color: string): CSSProperties {
  return { textAlign: 'right', fontFamily: 'var(--mono)', fontSize: 12.5, color, fontVariantNumeric: 'tabular-nums' };
}
function pulseDot(size: number): CSSProperties {
  return { width: size, height: size, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block', animation: 'livepulse 1.6s ease-in-out infinite' };
}
function winBtn(active: boolean): CSSProperties {
  return {
    padding: '5px 11px',
    border: 'none',
    borderRadius: 7,
    background: active ? 'var(--bg)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--dim)',
    font: 'inherit',
    fontFamily: 'var(--mono)',
    fontSize: 11.5,
    cursor: 'pointer',
    boxShadow: active ? '0 1px 2px rgba(0,0,0,.25)' : 'none',
  };
}
function seriesChip(on: boolean): CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '5px 9px',
    borderRadius: 7,
    border: '1px solid var(--border)',
    background: on ? 'var(--elev)' : 'transparent',
    color: on ? 'var(--text)' : 'var(--faint)',
    font: 'inherit',
    fontFamily: 'var(--mono)',
    fontSize: 11,
    cursor: 'pointer',
  };
}
function sideNavBtn(active: boolean): CSSProperties {
  return {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '9px 11px',
    marginBottom: 2,
    border: 'none',
    borderRadius: 7,
    background: active ? 'var(--elev)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--dim)',
    font: 'inherit',
    fontSize: 13.5,
    fontWeight: active ? 500 : 400,
    cursor: 'pointer',
    textAlign: 'left',
  };
}
function topNavBtn(active: boolean): CSSProperties {
  return {
    padding: '7px 12px',
    border: 'none',
    borderRadius: 7,
    background: active ? 'var(--elev)' : 'transparent',
    color: active ? 'var(--text)' : 'var(--dim)',
    font: 'inherit',
    fontSize: 13,
    fontWeight: active ? 500 : 400,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flex: 'none',
  };
}
