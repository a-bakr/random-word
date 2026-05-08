'use client';

import { motion } from 'motion/react';

export function TwisterItem({
  id,
  text,
  fontSize,
  isDark,
}: {
  id: string;
  text: string;
  fontSize: number;
  isDark: boolean;
}) {
  const cap = Math.min(fontSize, 44);
  return (
    <motion.div
      key={id}
      className="absolute inset-0 flex items-center justify-center px-8 pointer-events-none"
      initial={{ opacity: 0, filter: 'blur(16px)', scale: 0.95 }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
      exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.02 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <p
        className="leading-snug font-medium tracking-tight text-center select-none max-w-4xl"
        style={{ fontSize: `${cap}px`, color: isDark ? '#e4e4e7' : '#18181b' }}
      >
        {text}
      </p>
    </motion.div>
  );
}
