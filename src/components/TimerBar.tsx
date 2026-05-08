'use client';

import { Clock } from 'lucide-react';
import { Timer } from './Timer';

export function TimerBar({
  timerEnabled,
  toggleTimerEnabled,
  timerKey,
  duration,
  isTimerRunning,
  onTimerStop,
  onDurationChange,
}: {
  timerEnabled: boolean;
  toggleTimerEnabled: (e: React.MouseEvent) => void;
  timerKey: number;
  duration: number;
  isTimerRunning: boolean;
  onTimerStop: () => void;
  onDurationChange: (secs: number) => void;
}) {
  return (
    <div className="absolute bottom-6 left-6 z-10 flex items-center gap-3 pointer-events-auto">
      <button
        onClick={toggleTimerEnabled}
        className={`flex items-center gap-2 rounded-full px-4 py-2 bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur transition-all duration-300 text-sm font-medium ${timerEnabled
          ? 'text-zinc-700 dark:text-zinc-200 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-200/80 dark:hover:bg-zinc-800/80'
          : 'text-zinc-400/60 dark:text-zinc-500/60 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60'
          }`}
        aria-label={timerEnabled ? 'Disable timer' : 'Enable timer'}
        title={timerEnabled ? 'Disable timer' : 'Enable timer'}
      >
        <Clock size={16} strokeWidth={1.75} />
        <span>timer</span>
      </button>
      {timerEnabled && (
        <Timer
          key={timerKey}
          duration={duration}
          isRunning={isTimerRunning}
          onStop={onTimerStop}
          onDurationChange={onDurationChange}
        />
      )}
    </div>
  );
}
