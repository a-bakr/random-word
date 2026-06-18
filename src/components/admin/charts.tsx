import type { CSSProperties } from 'react';

export interface TrendPoint {
  sessions: number;
  words: number;
  recordings: number;
}

export type SeriesKey = 'sessions' | 'words' | 'recordings';

const SERIES_DEFS: { k: SeriesKey; c: string }[] = [
  { k: 'sessions', c: 'var(--accent)' },
  { k: 'words', c: 'var(--text)' },
  { k: 'recordings', c: 'var(--faint)' },
];

/**
 * Multi-series line chart, ported from the design's buildLineChart (inline SVG,
 * no chart library). Stretches to its container; uses non-scaling strokes.
 */
export function LineChart({
  buckets,
  series,
}: {
  buckets: TrendPoint[];
  series: Record<SeriesKey, boolean>;
}) {
  const w = 820,
    h = 230,
    pL = 4,
    pR = 4,
    pT = 14,
    pB = 8;
  const iW = w - pL - pR;
  const iH = h - pT - pB;
  const defs = SERIES_DEFS.filter(d => series[d.k]);
  let max = 1;
  buckets.forEach(b => defs.forEach(d => { if (b[d.k] > max) max = b[d.k]; }));
  const n = buckets.length;
  const X = (i: number) => pL + (n <= 1 ? iW / 2 : (i / (n - 1)) * iW);
  const Y = (v: number) => pT + iH - (v / max) * iH;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: h, display: 'block', overflow: 'visible' }}
    >
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => (
        <line
          key={'g' + i}
          x1={pL}
          x2={w - pR}
          y1={pT + iH - f * iH}
          y2={pT + iH - f * iH}
          style={{ stroke: 'var(--grid)', strokeWidth: 1 }}
        />
      ))}
      {defs.map(d => (
        <polyline
          key={d.k}
          vectorEffect="non-scaling-stroke"
          points={buckets.map((b, i) => X(i) + ',' + Y(b[d.k])).join(' ')}
          style={{
            fill: 'none',
            stroke: d.c,
            strokeWidth: 1.5,
            strokeLinejoin: 'round',
            strokeLinecap: 'round',
          }}
        />
      ))}
    </svg>
  );
}

/** Compact sparkline, ported from the design's buildSpark. */
export function Sparkline({
  values,
  color,
  style,
}: {
  values: number[];
  color: string;
  style?: CSSProperties;
}) {
  const w = 120,
    h = 32,
    pad = 3;
  const n = values.length;
  const max = values.length ? Math.max(...values) : 1;
  const min = values.length ? Math.min(...values) : 0;
  const X = (i: number) => pad + (n <= 1 ? 0 : (i / (n - 1)) * (w - 2 * pad));
  const Y = (v: number) => pad + (h - 2 * pad) - ((v - min) / (max - min || 1)) * (h - 2 * pad);
  const pts = values.map((v, i) => X(i) + ',' + Y(v)).join(' ');
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible', ...style }}
    >
      <polyline
        vectorEffect="non-scaling-stroke"
        points={pts}
        style={{
          fill: 'none',
          stroke: color,
          strokeWidth: 1.4,
          strokeLinejoin: 'round',
          strokeLinecap: 'round',
        }}
      />
    </svg>
  );
}
