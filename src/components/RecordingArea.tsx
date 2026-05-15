'use client';

import { Mic, Play, Square, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import type { Recording } from '../types';

function threeWords(text: string) {
  if (!text) return '';
  const ws = text.trim().split(/\s+/).filter(Boolean);
  if (ws.length <= 3) return text;
  return ws.slice(0, 3).join(' ') + '…';
}

export function RecordingArea({
  recordings,
  isRecording,
  playingId,
  transcribingId,
  onToggleRecord,
  onTogglePlayback,
  onRemove,
  onSelect,
  mode,
  onReplay,
  isTwisterPlaying,
}: {
  recordings: Recording[];
  isRecording: boolean;
  playingId: number | null;
  transcribingId: number | null;
  onToggleRecord: (e: React.MouseEvent) => void;
  onTogglePlayback: (id: number) => (e: React.MouseEvent) => void;
  onRemove: (id: number) => (e: React.MouseEvent) => void;
  onSelect: (id: number) => void;
  mode: 'words' | 'twisters';
  onReplay: (e: React.MouseEvent) => void;
  isTwisterPlaying: boolean;
}) {
  return (
    <div
      className="absolute bottom-6 left-6 z-20 flex flex-col items-start gap-1.5"
      onClick={e => e.stopPropagation()}
    >
      <AnimatePresence>
        {recordings.map(rec => (
          <motion.div
            key={rec.id}
            className="flex items-center gap-3 px-3 py-2 overflow-hidden"
            initial={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={onTogglePlayback(rec.id)}
              className="text-zinc-400/60 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors duration-300 flex-shrink-0"
              aria-label={playingId === rec.id ? 'Stop playback' : 'Play recording'}
            >
              {playingId === rec.id
                ? <Square size={16} strokeWidth={1.5} />
                : <Play  size={16} strokeWidth={1.5} />}
            </button>
            <span
              className="text-sm text-zinc-500 dark:text-zinc-400 max-w-[9rem] truncate cursor-pointer hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors duration-300"
              onClick={e => { e.stopPropagation(); onSelect(rec.id); }}
            >
              {transcribingId === rec.id
                ? <span className="animate-pulse">…</span>
                : threeWords(rec.transcript) || String(rec.num)}
            </span>
            <button
              onClick={onRemove(rec.id)}
              className="text-zinc-400/30 hover:text-red-400 dark:hover:text-red-400 transition-colors duration-300 flex-shrink-0"
              aria-label="Remove recording"
            >
              <X size={14} strokeWidth={1.5} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="flex items-center">
        {mode === 'twisters' && (
          <button
            onClick={onReplay}
            className={`rounded-full p-3 transition-all duration-500 ${isTwisterPlaying
              ? 'text-zinc-900 dark:text-zinc-50'
              : 'text-zinc-400 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
              }`}
            aria-label={isTwisterPlaying ? 'Stop audio' : 'Replay audio'}
          >
            {isTwisterPlaying ? <Square size={20} strokeWidth={1.5} /> : <Play size={20} strokeWidth={1.5} />}
          </button>
        )}
        <button
          onClick={onToggleRecord}
          className={`rounded-full p-3 transition-all duration-500 ${isRecording
            ? 'text-zinc-900 dark:text-zinc-50'
            : 'text-zinc-400/30 hover:text-zinc-900 dark:hover:text-zinc-50'
            }`}
          aria-label={isRecording ? 'Stop recording' : 'Start recording'}
        >
          <span className="relative flex">
            {isRecording && (
              <span className="absolute inset-0 rounded-full bg-red-400/40 dark:bg-red-400/30 animate-ping" />
            )}
            {isRecording ? <Square size={20} strokeWidth={1.5} /> : <Mic size={20} strokeWidth={1.5} />}
          </span>
        </button>
      </div>
    </div>
  );
}
