'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Type, Mic2, SlidersHorizontal, Info } from 'lucide-react';

const CX = 160, CY = 160, R = 140, INNER_R = 52;
const D = 68; // diagonal px offset from wheel center for icon positions

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

export function ControlWheel({
  visible,
  hoveredId,
  x,
  y,
  isDark,
}: {
  visible: boolean;
  hoveredId: string | null;
  x: number;
  y: number;
  isDark: boolean;
}) {
  const sectorBase  = isDark ? 'rgba(24,24,27,0.97)'  : 'rgba(244,244,245,0.97)';
  const sectorHover = isDark ? 'rgba(39,39,42,0.99)'  : 'rgba(212,212,216,0.99)';
  const strokeColor = isDark ? 'rgba(82,82,91,0.55)'  : 'rgba(113,113,122,0.55)';
  const iconColor   = isDark ? 'rgba(250,250,250,0.9)': 'rgba(24,24,27,0.9)';
  const iconActive  = isDark ? '#ffffff'               : '#000000';
  const labelColor  = isDark ? 'rgba(250,250,250,0.7)': 'rgba(24,24,27,0.65)';
  const labelActive = isDark ? '#ffffff'               : '#000000';
  const backdropBg  = isDark ? 'bg-zinc-950/60'        : 'bg-zinc-100/60';

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
          <div className={`absolute inset-0 ${backdropBg} backdrop-blur-sm`} />

          <motion.svg
            viewBox="0 0 320 320"
            className="absolute w-[340px] h-[340px]"
            style={{ left: x, top: y, transform: 'translate(-50%, -50%)' }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {SEGMENTS.map(seg => {
              const active = hoveredId === seg.id;
              return (
                <path
                  key={seg.id}
                  d={seg.path}
                  fill={active ? sectorHover : sectorBase}
                  stroke={strokeColor}
                  strokeWidth="1.5"
                  style={{ transition: 'fill 0.15s ease' }}
                />
              );
            })}

            <circle cx={CX} cy={CY} r={R}
              fill="none" stroke={strokeColor} strokeWidth="1.5"
              strokeDasharray="8 5" strokeLinecap="round" />

            <circle cx={CX} cy={CY} r={INNER_R}
              fill="none" stroke={strokeColor} strokeWidth="1"
              strokeDasharray="5 4" strokeLinecap="round" />

            {DIVIDERS.map((d, i) => (
              <line key={i}
                x1={d.x1} y1={d.y1} x2={d.x2} y2={d.y2}
                stroke={strokeColor} strokeWidth="1.5"
                strokeDasharray="6 4" strokeLinecap="round" />
            ))}
          </motion.svg>

          {SEGMENTS.map((seg, i) => {
            const active = hoveredId === seg.id;
            return (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.25, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                className="absolute flex flex-col items-center gap-1.5 pointer-events-none select-none"
                style={{
                  left: x + seg.ix,
                  top: y + seg.iy,
                  transform: 'translate(-50%, -50%)',
                  opacity: active ? 1 : 0.6,
                  transition: 'opacity 0.12s ease',
                }}
              >
                <seg.Icon size={22} strokeWidth={1.5} color={active ? iconActive : iconColor} />
                <span
                  className="text-[12px] font-semibold tracking-wide"
                  style={{ color: active ? labelActive : labelColor }}
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
