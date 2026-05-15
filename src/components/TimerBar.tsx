'use client';

import { Clock, Play, Square } from 'lucide-react';
import { Timer } from './Timer';

export function TimerBar({
  timerEnabled,
  toggleTimerEnabled,
  timerKey,
  duration,
  isTimerRunning,
  onTimerStop,
  onDurationChange,
  mode,
  onReplay,
  isTwisterPlaying,
}: {
  timerEnabled: boolean;
  toggleTimerEnabled: (e: React.MouseEvent) => void;
  timerKey: number;
  duration: number;
  isTimerRunning: boolean;
  onTimerStop: () => void;
  onDurationChange: (secs: number) => void;
  mode: 'words' | 'twisters';
  onReplay: (e: React.MouseEvent) => void;
  isTwisterPlaying: boolean;
}) {
  return (
    <div className="absolute bottom-6 right-6 z-10 flex items-center gap-3 pointer-events-auto">
      {timerEnabled && (
        <Timer
          key={timerKey}
          duration={duration}
          isRunning={isTimerRunning}
          onStop={onTimerStop}
          onDurationChange={onDurationChange}
        />
      )}
      <button
        onClick={toggleTimerEnabled}
        className={`flex items-center justify-center rounded-full p-3 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur transition-all duration-300 ${timerEnabled
          ? 'text-zinc-800 dark:text-zinc-100 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80'
          : 'text-zinc-500 dark:text-zinc-300 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
          }`}
        style={{ filter: 'url(#sketch)' }}
        aria-label={timerEnabled ? 'Disable timer' : 'Enable timer'}
        title={timerEnabled ? 'Disable timer' : 'Enable timer'}
      >
        <Clock size={18} strokeWidth={2.5} />
      </button>
      {mode === 'twisters' && (
        <button
          onClick={onReplay}
          className={`rounded-full p-3 transition-all duration-500 ${isTwisterPlaying
            ? 'text-zinc-900 dark:text-zinc-50'
            : 'text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50'
            }`}
          style={{ filter: 'url(#sketch)' }}
          aria-label={isTwisterPlaying ? 'Stop audio' : 'Replay audio'}
        >
          {isTwisterPlaying ? <Square size={20} strokeWidth={2.5} /> : <Play size={20} strokeWidth={2.5} />}
        </button>
      )}
    </div>
  );
}
