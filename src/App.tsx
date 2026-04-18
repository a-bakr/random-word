/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { generate } from 'random-words';
import { Moon, Sun, Volume2, VolumeX, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type WordEntry = { text: string; x: number; y: number; id: number; color: string };

const getRandomColor = (isDark: boolean) =>
  `hsl(${Math.floor(Math.random() * 360)}, 70%, ${isDark ? 75 : 40}%)`;

let audioCtx: AudioContext | null = null;

const playPopSound = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  const frequencies = [523.25, 587.33, 659.25, 783.99, 880.00];
  const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
};

const playBeepSound = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();

  // Two-tone beep: 440Hz then 554Hz, distinct from pop sounds
  [440, 554].forEach((freq, i) => {
    const osc = audioCtx!.createOscillator();
    const gainNode = audioCtx!.createGain();
    const start = audioCtx!.currentTime + i * 0.22;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, start);
    gainNode.gain.setValueAtTime(0, start);
    gainNode.gain.linearRampToValueAtTime(0.2, start + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.001, start + 0.6);
    osc.connect(gainNode);
    gainNode.connect(audioCtx!.destination);
    osc.start(start);
    osc.stop(start + 0.6);
  });
};

// ─── Timer ────────────────────────────────────────────────────────────────────
const DURATION = 60; // seconds

function Timer({ isRunning, onReset }: { isRunning: boolean; onReset: () => void }) {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevElapsedRef = useRef(0);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed(e => e + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setElapsed(0);
      prevElapsedRef.current = 0;
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  // Beep at 60s, then every 30s after
  useEffect(() => {
    if (!isRunning) return;
    const prev = prevElapsedRef.current;
    prevElapsedRef.current = elapsed;
    if (elapsed === DURATION) {
      playBeepSound();
    } else if (elapsed > DURATION && (elapsed - DURATION) % 30 === 0 && elapsed !== prev) {
      playBeepSound();
    }
  }, [elapsed, isRunning]);

  const remaining = DURATION - elapsed;
  const isOvertime = elapsed >= DURATION;

  const display = () => {
    const secs = isOvertime ? elapsed - DURATION : Math.abs(remaining);
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    const formatted = `${m}:${String(s).padStart(2, '0')}`;
    return isOvertime ? `+${formatted}` : formatted;
  };

  if (!isRunning && elapsed === 0) {
    return (
      <div className="absolute top-6 left-6 z-10 text-2xl font-black font-mono tabular-nums text-zinc-400/15 dark:text-zinc-600/15 select-none pointer-events-none tracking-tight">
        1:00
      </div>
    );
  }

  return (
    <div
      className="absolute top-6 left-6 z-10 flex items-center gap-2"
      onClick={e => { e.stopPropagation(); onReset(); }}
    >
      <motion.span
        key={isOvertime ? 'over' : 'count'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`text-2xl font-black font-mono tabular-nums tracking-tight cursor-pointer transition-colors duration-500 ${isOvertime
            ? 'text-amber-400/80 dark:text-amber-300/80'
            : 'text-zinc-400/70 dark:text-zinc-500/70'
          }`}
      >
        {display()}
      </motion.span>
      <RotateCcw
        size={16}
        strokeWidth={2}
        className="text-zinc-400/30 dark:text-zinc-600/30 cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300"
      />
    </div>
  );
}

// ─── WordItem ─────────────────────────────────────────────────────────────────
// Corrects position after mount so the word never overflows the viewport.
function WordItem({ word, fontSize }: { word: WordEntry; fontSize: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: word.x, y: word.y });

  useEffect(() => {
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
  }, []);

  return (
    <motion.div
      ref={ref}
      className="absolute pointer-events-none"
      style={{ left: pos.x, top: pos.y }}
      initial={{ opacity: 0, filter: 'blur(16px)', scale: 0.85, x: '-50%', y: '-50%' }}
      animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, x: '-50%', y: '-50%' }}
      exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.05, x: '-50%', y: '-50%' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
    >
      <h1
        className="leading-none font-medium tracking-tight text-center select-none capitalize whitespace-nowrap drop-shadow-sm"
        style={{ color: word.color, fontSize: `${fontSize}px` }}
      >
        {word.text}
      </h1>
    </motion.div>
  );
}

// ─── NumInput ─────────────────────────────────────────────────────────────────
// A bare number input that looks like plain text until focused.
function NumInput({
  value, min, max, title, width,
  onCommit,
}: {
  value: number;
  min: number;
  max: number;
  title: string;
  width: string;
  onCommit: (n: number) => void;
}) {
  const [draft, setDraft] = useState(String(value));

  useEffect(() => { setDraft(String(value)); }, [value]);

  const commit = () => {
    const n = parseInt(draft, 10);
    if (!isNaN(n) && n >= min && n <= max) onCommit(n);
    else setDraft(String(value));
  };

  return (
    <input
      type="number"
      min={min}
      max={max}
      value={draft}
      title={title}
      style={{ width }}
      onChange={e => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        e.stopPropagation();
        if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        if (e.key === 'Escape') { setDraft(String(value)); (e.target as HTMLInputElement).blur(); }
      }}
      onClick={e => e.stopPropagation()}
      className="bg-transparent border-none outline-none text-center text-sm font-mono
        text-zinc-400/30 hover:text-zinc-500/40 focus:text-zinc-900
        dark:focus:text-zinc-50 transition-colors duration-300 cursor-pointer
        focus:cursor-text p-3 rounded-full"
    />
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [words, setWords] = useState<WordEntry[]>([]);
  const [maxWords, setMaxWords] = useState(() => Number(localStorage.getItem('maxWords')) || 1);
  const [fontSize, setFontSize] = useState(() => Number(localStorage.getItem('fontSize')) || 80);
  const [isDark, setIsDark] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    setWords([{
      text: generate() as string,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      id: Date.now(),
      color: getRandomColor(prefersDark),
    }]);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  const handleScreenClick = (e: React.MouseEvent) => {
    if (!hasClicked) setHasClicked(true);
    if (isSoundEnabled) playPopSound();
    if (!isTimerRunning) setIsTimerRunning(true);

    setWords(prev => [
      ...prev,
      { text: generate() as string, x: e.clientX, y: e.clientY, id: Date.now(), color: getRandomColor(isDark) },
    ].slice(-maxWords));
  };

  return (
    <div
      className="relative h-screen w-screen cursor-pointer overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-700"
      onClick={handleScreenClick}
    >
      {/* Controls */}
      <div className="absolute right-6 top-6 z-10 flex items-center">
        <NumInput
          value={fontSize}
          min={12}
          max={200}
          title="Font size (px)"
          width="3rem"
          onCommit={n => { localStorage.setItem('fontSize', String(n)); setFontSize(n); }}
        />
        <NumInput
          value={maxWords}
          min={1}
          max={10}
          title="Words on screen"
          width="2.5rem"
          onCommit={n => { localStorage.setItem('maxWords', String(n)); setMaxWords(n); setWords(prev => prev.slice(-n)); }}
        />
        <button
          onClick={e => { e.stopPropagation(); setIsSoundEnabled(v => !v); }}
          className="rounded-full p-3 text-zinc-400/30 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-500"
          aria-label={isSoundEnabled ? 'Mute sound' : 'Enable sound'}
        >
          {isSoundEnabled ? <Volume2 size={20} strokeWidth={1.5} /> : <VolumeX size={20} strokeWidth={1.5} />}
        </button>
        <button
          onClick={e => { e.stopPropagation(); setIsDark(v => !v); }}
          className="rounded-full p-3 text-zinc-400/30 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-500"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Words */}
      <AnimatePresence>
        {words.map(word => (
          <WordItem key={word.id} word={word} fontSize={fontSize} />
        ))}
      </AnimatePresence>

      {/* Timer */}
      <Timer isRunning={isTimerRunning} onReset={() => setIsTimerRunning(false)} />

      {/* Hint */}
      <AnimatePresence>
        {!hasClicked && (
          <motion.div
            exit={{ opacity: 0, y: 10, filter: 'blur(5px)' }}
            transition={{ duration: 0.5 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 text-xs md:text-sm text-zinc-400/50 dark:text-zinc-600/50 tracking-[0.5em] uppercase select-none pointer-events-none"
          >
            Tap anywhere
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
