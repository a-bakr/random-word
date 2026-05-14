'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import type { WordEntry } from '../types';

export function WordItem({
  word,
  fontSize,
  centered = false,
}: {
  word: WordEntry;
  fontSize: number;
  centered?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: word.x, y: word.y });

  useEffect(() => {
    if (centered) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const pad = 16;
    let x = word.x;
    let y = word.y;
    if (rect.right > window.innerWidth - pad) x -= rect.right - (window.innerWidth - pad);
    if (rect.left < pad) x += pad - rect.left;
    if (rect.bottom > window.innerHeight - pad) y -= rect.bottom - (window.innerHeight - pad);
    if (rect.top < pad) y += pad - rect.top;
    if (x !== word.x || y !== word.y) setPos({ x, y });
  }, [centered, word.x, word.y]);

  const style = centered
    ? { left: '50%', top: '50%' }
    : { left: pos.x, top: pos.y };

  return (
    <motion.div
      ref={ref}
      className="absolute pointer-events-none"
      style={style}
      initial={{ opacity: 0, filter: 'blur(16px)', scale: 0.85, x: '-50%', y: '-50%' }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, x: '-50%', y: '-50%' }}
      exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.05, x: '-50%', y: '-50%' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1
        className={`leading-none font-medium tracking-tight text-center select-none capitalize whitespace-nowrap drop-shadow-sm ${
          centered ? 'text-zinc-900 dark:text-zinc-50' : ''
        }`}
        style={{
          fontSize: `${fontSize}px`,
          ...(centered ? {} : { color: word.color }),
        }}
      >
        {word.text}
      </h1>
    </motion.div>
  );
}
