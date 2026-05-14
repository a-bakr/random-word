'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Type, Mic2, SlidersHorizontal, Info } from 'lucide-react';

const RADIUS = 118;

const SEGMENTS = [
  { id: 'words',    label: 'Words',    Icon: Type,               angle: -135 },
  { id: 'twisters', label: 'Twisters', Icon: Mic2,               angle: -45  },
  { id: 'settings', label: 'Settings', Icon: SlidersHorizontal,  angle: 45   },
  { id: 'about',    label: 'About',    Icon: Info,               angle: 135  },
];

function angleDiff(a: number, b: number): number {
  let d = ((a - b) % 360 + 360) % 360;
  if (d > 180) d = 360 - d;
  return d;
}

function segmentPos(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: Math.cos(rad) * RADIUS, y: Math.sin(rad) * RADIUS };
}

export function ControlWheel({
  visible,
  onSelect,
  onDismiss,
}: {
  visible: boolean;
  onSelect: (id: string) => void;
  onDismiss: () => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const centerRef = useRef({ x: 0, y: 0 });
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (visible) {
      setHoveredId(null);
      centerRef.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    }
  }, [visible]);

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = e.clientX - centerRef.current.x;
    const dy = e.clientY - centerRef.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 36) { setHoveredId(null); return; }
    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    const nearest = SEGMENTS.reduce((prev, curr) =>
      angleDiff(curr.angle, angle) < angleDiff(prev.angle, angle) ? curr : prev
    );
    setHoveredId(nearest.id);
  };

  const handlePointerUp = () => {
    if (hoveredId) onSelect(hoveredId);
    else onDismiss();
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          ref={overlayRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 z-50 flex items-center justify-center"
          style={{ touchAction: 'none' }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* backdrop */}
          <div className="absolute inset-0 bg-zinc-950/30 dark:bg-zinc-950/60 backdrop-blur-sm" />

          {/* segments */}
          {SEGMENTS.map((seg, i) => {
            const { x, y } = segmentPos(seg.angle);
            const isHovered = hoveredId === seg.id;
            return (
              <motion.div
                key={seg.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                animate={{
                  opacity: 1,
                  x,
                  y,
                  scale: isHovered ? 1.15 : 1,
                }}
                exit={{ opacity: 0, x: 0, y: 0, scale: 0.4 }}
                transition={{
                  opacity:  { duration: 0.22, delay: i * 0.04 },
                  x:        { duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] },
                  y:        { duration: 0.35, delay: i * 0.04, ease: [0.16, 1, 0.3, 1] },
                  scale:    { duration: 0.2 },
                }}
                className="absolute flex flex-col items-center gap-1.5 pointer-events-none select-none"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center transition-colors duration-150
                  ${isHovered
                    ? 'bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50'
                    : 'bg-zinc-100/70 dark:bg-zinc-800/70 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <seg.Icon size={22} strokeWidth={1.5} />
                </div>
                <span className={`text-[11px] font-medium tracking-wide transition-colors duration-150
                  ${isHovered ? 'text-zinc-50' : 'text-zinc-300 dark:text-zinc-500'}`}
                >
                  {seg.label}
                </span>
              </motion.div>
            );
          })}

          {/* center dot */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-3 h-3 rounded-full bg-zinc-400/60 dark:bg-zinc-500/60"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
