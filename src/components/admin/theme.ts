import type { CSSProperties } from 'react';

export type ThemeMode = 'dark' | 'light';

/** Dark/light token maps, ported from the Claude Design prototype. */
export function themeVars(theme: ThemeMode): Record<string, string> {
  return theme === 'light'
    ? {
        '--bg': '#fafafa',
        '--panel': '#ffffff',
        '--elev': '#f4f4f5',
        '--border': '#e4e4e7',
        '--grid': '#ededef',
        '--text': '#09090b',
        '--dim': '#52525b',
        '--faint': '#a1a1aa',
        '--bar': '#d4d4d8',
      }
    : {
        '--bg': '#09090b',
        '--panel': '#0f0f11',
        '--elev': '#17171a',
        '--border': '#26262b',
        '--grid': '#1c1c20',
        '--text': '#fafafa',
        '--dim': '#a1a1aa',
        '--faint': '#71717a',
        '--bar': '#3f3f46',
      };
}

/** Accent palette. The dashboard uses a fixed green accent. */
export function accentVars(): Record<string, string> {
  return { '--accent': '#22c55e', '--accent-dim': 'rgba(34,197,94,.15)' };
}

/**
 * CSS variables for the dashboard root container. `sansVar`/`monoVar` are the
 * next/font CSS-variable names supplied by the page.
 */
export function rootVars(theme: ThemeMode, sansVar: string, monoVar: string): CSSProperties {
  return {
    ...themeVars(theme),
    ...accentVars(),
    '--mono': `${monoVar}, ui-monospace, monospace`,
    '--sans': `${sansVar}, ui-sans-serif, system-ui, sans-serif`,
  } as CSSProperties;
}

/** Abbreviate big numbers: 1.2k, 3.4m. */
export function fmt(n: number | null | undefined): string {
  if (n == null || isNaN(n)) return '–';
  const a = Math.abs(n);
  if (a >= 1e6) {
    const v = n / 1e6;
    return (a >= 1e7 ? Math.round(v) : Number(v.toFixed(1))) + 'm';
  }
  if (a >= 1e3) {
    const v = n / 1e3;
    return (a >= 1e4 ? Math.round(v) : Number(v.toFixed(1))) + 'k';
  }
  return '' + Math.round(n);
}

/** Relative time from a number of seconds. */
export function relSec(sec: number): string {
  sec = Math.max(0, Math.floor(sec));
  if (sec < 60) return sec + 's';
  const m = Math.floor(sec / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h';
  return Math.floor(h / 24) + 'd';
}

/** Relative time from an ISO timestamp. */
export function relTs(ts: string): string {
  return relSec((Date.now() - new Date(ts).getTime()) / 1000);
}

export interface BarItem {
  label: string;
  nFmt: string;
  pct: string;
  barColor: string;
}

/** Normalize a ranked {label,n} list into BarList rows (top item highlighted). */
export function mkBars(list: { label: string; n: number }[]): BarItem[] {
  const max = Math.max(...list.map(x => x.n), 1);
  return list.map((x, i) => ({
    label: x.label,
    nFmt: fmt(x.n),
    pct: Math.max(2, Math.round((x.n / max) * 100)) + '%',
    barColor: i === 0 ? 'var(--accent)' : 'var(--bar)',
  }));
}

export function eventColor(name: string): string {
  if (name.indexOf('recording') >= 0) return 'var(--accent)';
  if (name.indexOf('generated') >= 0) return 'var(--text)';
  return 'var(--faint)';
}
