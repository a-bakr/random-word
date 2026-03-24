/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { generate } from 'random-words';
import { Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Generate colors that contrast well based on the current theme
const getRandomColor = (isDark: boolean) => 
  `hsl(${Math.floor(Math.random() * 360)}, 70%, ${isDark ? 75 : 40}%)`;

// Initialize AudioContext lazily to comply with browser autoplay policies
let audioCtx: AudioContext | null = null;

const playPopSound = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  // Pentatonic scale (C5, D5, E5, G5, A5) for a pleasant, musical feel
  const frequencies = [523.25, 587.33, 659.25, 783.99, 880.00];
  const freq = frequencies[Math.floor(Math.random() * frequencies.length)];

  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

  // Envelope: quick attack, smooth exponential decay
  gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.15, audioCtx.currentTime + 0.02);
  gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);

  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.4);
};

export default function App() {
  const [wordData, setWordData] = useState({ text: '', x: 0, y: 0, id: 0, color: '' });
  const [isDark, setIsDark] = useState(false);
  const [hasClicked, setHasClicked] = useState(false);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);

  useEffect(() => {
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    
    // Generate initial word in the center
    setWordData({
      text: generate() as string,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      id: Date.now(),
      color: getRandomColor(prefersDark)
    });
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleScreenClick = (e: React.MouseEvent) => {
    if (!hasClicked) setHasClicked(true);
    if (isSoundEnabled) playPopSound();
    
    setWordData({
      text: generate() as string,
      x: e.clientX,
      y: e.clientY,
      id: Date.now(),
      color: getRandomColor(isDark)
    });
  };

  const toggleTheme = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDark(!isDark);
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSoundEnabled(!isSoundEnabled);
  };

  return (
    <div
      className="relative h-screen w-screen cursor-pointer overflow-hidden bg-zinc-50 dark:bg-zinc-950 transition-colors duration-700"
      onClick={handleScreenClick}
    >
      {/* Controls - Ultra subtle */}
      <div className="absolute right-6 top-6 z-10 flex gap-2">
        <button
          onClick={toggleSound}
          className="rounded-full p-3 text-zinc-400/30 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-500"
          aria-label={isSoundEnabled ? "Mute sound" : "Enable sound"}
        >
          {isSoundEnabled ? <Volume2 size={20} strokeWidth={1.5} /> : <VolumeX size={20} strokeWidth={1.5} />}
        </button>
        <button
          onClick={toggleTheme}
          className="rounded-full p-3 text-zinc-400/30 hover:text-zinc-900 dark:hover:text-zinc-50 transition-all duration-500"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={20} strokeWidth={1.5} /> : <Moon size={20} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Word Display */}
      <AnimatePresence>
        {wordData.text && (
          <motion.div
            key={wordData.id}
            className="absolute pointer-events-none"
            style={{ left: wordData.x, top: wordData.y }}
            initial={{ opacity: 0, filter: 'blur(16px)', scale: 0.85, x: "-50%", y: "-50%" }}
            animate={{ opacity: 1, filter: 'blur(0px)', scale: 1, x: "-50%", y: "-50%" }}
            exit={{ opacity: 0, filter: 'blur(16px)', scale: 1.05, x: "-50%", y: "-50%" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 
              className="text-[clamp(3rem,8vw,8rem)] leading-none font-medium tracking-tight text-center select-none capitalize whitespace-nowrap drop-shadow-sm"
              style={{ color: wordData.color }}
            >
              {wordData.text}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

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
