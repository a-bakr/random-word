'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Type, Mic2, SlidersHorizontal, Info } from 'lucide-react';

const CX = 160, CY = 160, R = 140, INNER_R = 52;
// Icon positions: diagonal px offset from screen center (CSS pixels, not SVG units)
const D = 68;

function deg2rad(d: number) { return (d * Math.PI) / 180; }
function pt(deg: number, r: number): [number, number] {
  return [CX + r * Math.cos(deg2rad(deg)), CY + r * Math.sin(deg2rad(deg))];
}

function sectorPath(a1: number, a2: number) {
  const [ox1, oy1] = pt(a1, R);
  const [ox2, oy2] = pt(a2, R);
  const [ix1, iy1] = pt(a1, INNER_R);
  const [ix2, iy2] = pt(a2, INNER_R);
  return [
    `M ${ix1.toFixed(2)} ${iy1.toFixed(2)}`,
    `L ${ox1.toFixed(2)} ${oy1.toFixed(2)}`,
    `A ${R} ${R} 0 0 1 ${ox2.toFixed(2)} ${oy2.toFixed(2)}`,
    `L ${ix2.toFixed(2)} ${iy2.toFixed(2)}`,
    `A ${INNER_R} ${INNER_R} 0 0 0 ${ix1.toFixed(2)} ${iy1.toFixed(2)}`,
    'Z',
  ].join(' ');
}

const PALETTE: Record<string, { base: string; active: string; stroke: string; iconActive: string }> = {
  twisters: { base: 'rgba(30,12,48,0.88)', active: 'rgba(88,28,135,0.96)', stroke: 'rgba(168,85,247,0.45)', iconActive: '#c084fc' },
  settings:  { base: 'rgba(8,24,47,0.88)',  active: 'rgba(29,78,216,0.96)', stroke: 'rgba(99,102,241,0.45)', iconActive: '#818cf8' },
  about:     { base: 'rgba(47,31,8,0.88)',  active: 'rgba(180,83,9,0.96)',  stroke: 'rgba(245,158,11,0.45)', iconActive: '#fcd34d' },
  words:     { base: 'rgba(8,47,24,0.88)',  active: 'rgba(21,128,61,0.96)', stroke: 'rgba(34,197,94,0.45)',  iconActive: '#6ee7b7' },
};

const SEGMENTS = [
  { id: 'twisters', label: 'Twisters', Icon: Mic2,             path: sectorPath(180, 270), ix: -D, iy: -D },
  { id: 'settings', label: 'Settings', Icon: SlidersHorizontal, path: sectorPath(270, 360), ix:  D, iy: -D },
  { id: 'about',    label: 'About',    Icon: Info,              path: sectorPath(0, 90),    ix:  D, iy:  D },
  { id: 'words',    label: 'Words',    Icon: Type,              path: sectorPath(90, 180),  ix: -D, iy:  D },
];

const DIVIDERS = [0, 90, 180, 270].map(deg => {
  const [x1, y1] = pt(deg, INNER_R);
  const [x2, y2] = pt(deg, R);
  return { x1, y1, x2, y2 };
});

export function ControlWheel({ visible, hoveredId }: { visible: boolean; hoveredId: string | null }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-0 z-50 pointer-events-none"
        >
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" />

          <motion.svg
            viewBox="0 0 320 320"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {SEGMENTS.map(seg => {
              const p = PALETTE[seg.id];
              const active = hoveredId === seg.id;
              return (
                <path
                  key={seg.id}
                  d={seg.path}
                  fill={active ? p.active : p.base}
                  stroke={p.stroke}
                  strokeWidth="1.5"
                  style={{ transition: 'fill 0.15s ease' }}
                />
              );
            })}

            {/* outer ring – dashed for sketchy feel */}
            <circle cx={CX} cy={CY} r={R}
              fill="none" stroke="rgba(113,113,122,0.55)" strokeWidth="1.5"
              strokeDasharray="8 5" strokeLinecap="round" />

            {/* inner ring */}
            <circle cx={CX} cy={CY} r={INNER_R}
              fill="none" stroke="rgba(113,113,122,0.35)" strokeWidth="1"
              strokeDasharray="5 4" strokeLinecap="round" />

            {/* dividers – from inner ring to outer */}
            {DIVIDERS.map((d, i) => (
              <line key={i}
                x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
                stroke="rgba(113,113,122,0.5)" strokeWidth="1.5"
                strokeDasharray="6 4" strokeLinecap="round" />
            ))}
          </motion.svg>

          {SEGMENTS.map((seg, i) => {
            const active = hoveredId === seg.id;
            const p = PALETTE[seg.id];
            return (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="absolute flex flex-col items-center gap-1.5 pointer-events-none select-none"
                style={{
                  top: `calc(50% + ${seg.iy}px)`,
                  left: `calc(50% + ${seg.ix}px)`,
                  transform: 'translate(-50%, -50%)',
                  opacity: active ? 1 : 0.6,
                  transition: 'opacity 0.12s ease',
                }}
              >
                <seg.Icon
                  size={22}
                  strokeWidth={1.5}
                  color={active ? p.iconActive : 'rgba(255,255,255,0.8)'}
                />
                <span
                  className="text-[12px] font-semibold tracking-wide"
                  style={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.65)' }}
                >
                  {seg.label}
                </span>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
