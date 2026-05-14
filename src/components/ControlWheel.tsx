'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Type, Mic2, SlidersHorizontal, Info } from 'lucide-react';

const CX = 160, CY = 160, R = 140, ICON_R = 88;
const DIAG = ICON_R * Math.SQRT1_2;

function deg2rad(d: number) { return (d * Math.PI) / 180; }

function pt(deg: number, r: number): [number, number] {
  return [CX + r * Math.cos(deg2rad(deg)), CY + r * Math.sin(deg2rad(deg))];
}

function sectorPath(a1: number, a2: number) {
  const [x1, y1] = pt(a1, R);
  const [x2, y2] = pt(a2, R);
  return `M ${CX} ${CY} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${R} ${R} 0 0 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
}

const SEGMENTS = [
  {
    id: 'twisters',
    label: 'Twisters',
    Icon: Mic2,
    path: sectorPath(180, 270),
    ix: -DIAG,
    iy: -DIAG,
  },
  {
    id: 'settings',
    label: 'Settings',
    Icon: SlidersHorizontal,
    path: sectorPath(270, 360),
    ix: DIAG,
    iy: -DIAG,
  },
  {
    id: 'about',
    label: 'About',
    Icon: Info,
    path: sectorPath(0, 90),
    ix: DIAG,
    iy: DIAG,
  },
  {
    id: 'words',
    label: 'Words',
    Icon: Type,
    path: sectorPath(90, 180),
    ix: -DIAG,
    iy: DIAG,
  },
];

const DIVIDERS = [0, 90, 180, 270].map(deg => {
  const [x2, y2] = pt(deg, R);
  return { x1: CX, y1: CY, x2, y2 };
});

export function ControlWheel({
  visible,
  hoveredId,
}: {
  visible: boolean;
  hoveredId: string | null;
}) {
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
          {/* backdrop */}
          <div className="absolute inset-0 bg-zinc-950/50 backdrop-blur-sm" />

          {/* SVG pie */}
          <motion.svg
            viewBox="0 0 320 320"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px]"
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.4, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* sectors */}
            {SEGMENTS.map(seg => (
              <path
                key={seg.id}
                d={seg.path}
                fill={
                  hoveredId === seg.id
                    ? 'rgba(63,63,70,0.96)'
                    : 'rgba(9,9,11,0.88)'
                }
                style={{ transition: 'fill 0.12s ease' }}
              />
            ))}

            {/* outer ring */}
            <circle
              cx={CX} cy={CY} r={R}
              fill="none"
              stroke="rgba(82,82,91,0.5)"
              strokeWidth="1"
            />

            {/* dividers */}
            {DIVIDERS.map((d, i) => (
              <line
                key={i}
                x1={d.x1} y1={d.y1}
                x2={d.x2} y2={d.y2}
                stroke="rgba(82,82,91,0.5)"
                strokeWidth="1"
              />
            ))}

            {/* center dot */}
            <circle cx={CX} cy={CY} r={14} fill="rgba(82,82,91,0.4)" />
          </motion.svg>

          {/* icon + label overlays */}
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
                  top: `calc(50% + ${seg.iy}px)`,
                  left: `calc(50% + ${seg.ix}px)`,
                  transform: 'translate(-50%, -50%)',
                  transition: 'opacity 0.12s ease',
                  opacity: active ? 1 : 0.55,
                }}
              >
                <seg.Icon
                  size={20}
                  strokeWidth={1.5}
                  color={active ? '#ffffff' : 'rgba(255,255,255,0.8)'}
                />
                <span
                  className="text-[11px] font-medium tracking-wide"
                  style={{ color: active ? '#ffffff' : 'rgba(255,255,255,0.6)' }}
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
