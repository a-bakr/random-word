'use client';

import { Play, Square } from 'lucide-react';
import { motion } from 'motion/react';
import type { WarmupExercise, WarmupCategory } from '../lib/warmup';

const CATEGORY_META: Record<WarmupCategory, { label: string; color: string; border: string }> = {
  breathing:    { label: '🌬 BREATHE',     color: 'text-sky-500 dark:text-sky-400',      border: 'border-sky-300 dark:border-sky-700' },
  physical:     { label: '💪 STRETCH',     color: 'text-orange-500 dark:text-orange-400', border: 'border-orange-300 dark:border-orange-700' },
  resonance:    { label: '🎵 RESONATE',    color: 'text-violet-500 dark:text-violet-400', border: 'border-violet-300 dark:border-violet-700' },
  articulation: { label: '👅 ARTICULATE',  color: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-700' },
  pitch:        { label: '🎼 PITCH',       color: 'text-amber-500 dark:text-amber-400',   border: 'border-amber-300 dark:border-amber-700' },
  projection:   { label: '📢 PROJECT',     color: 'text-rose-500 dark:text-rose-400',     border: 'border-rose-300 dark:border-rose-700' },
};

function BreathingFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      <circle cx="70" cy="70" r="6" stroke="currentColor" strokeWidth="2.5" />
      <path d="M70 70 Q85 55 100 70 Q85 85 70 70" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M70 70 Q55 55 40 70 Q55 85 70 70" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M58 44 Q70 30 82 44" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M58 96 Q70 110 82 96" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M44 58 Q30 70 44 82" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M96 58 Q110 70 96 82" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M47 37 Q70 18 93 37" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M47 103 Q70 122 93 103" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M37 47 Q18 70 37 93" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M103 47 Q122 70 103 93" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function PhysicalFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* head */}
      <circle cx="70" cy="28" r="12" stroke="currentColor" strokeWidth="2.5" />
      {/* body */}
      <line x1="70" y1="40" x2="70" y2="90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* arms raised */}
      <path d="M70 55 Q52 40 38 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M70 55 Q88 40 102 28" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* hands */}
      <circle cx="38" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="102" cy="28" r="4" stroke="currentColor" strokeWidth="2" />
      {/* legs */}
      <path d="M70 90 Q58 108 50 118" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M70 90 Q82 108 90 118" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* feet */}
      <line x1="50" y1="118" x2="42" y2="118" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="90" y1="118" x2="98" y2="118" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function ResonanceFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* open mouth shape */}
      <path d="M35 60 Q70 55 105 60 Q105 95 70 100 Q35 95 35 60Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* lips curve */}
      <path d="M35 60 Q70 72 105 60" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* tongue */}
      <path d="M55 85 Q70 95 85 85" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* waves */}
      <path d="M112 55 Q122 62 112 69 Q122 76 112 83" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M122 50 Q136 60 122 70 Q136 80 122 90" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

function ArticulationFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* big mouth open */}
      <path d="M20 55 Q70 48 120 55 Q120 100 70 108 Q20 100 20 55Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* upper lip */}
      <path d="M20 55 Q45 65 70 62 Q95 65 120 55" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* tongue sticking out far */}
      <path d="M55 95 Q70 88 85 95 Q85 130 70 132 Q55 130 55 95Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* teeth */}
      <line x1="48" y1="63" x2="48" y2="74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="62" y1="61" x2="62" y2="73" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="78" y1="61" x2="78" y2="73" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="92" y1="63" x2="92" y2="74" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function PitchFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* ascending then descending wave */}
      <path d="M12 100 Q25 92 35 80 Q45 68 55 55 Q65 42 75 32 Q85 22 95 32 Q105 42 115 55 Q125 68 128 80" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* second wave below, fainter */}
      <path d="M12 115 Q25 108 35 97 Q45 86 55 75 Q65 64 75 55 Q85 46 95 55 Q105 64 115 75 Q125 86 128 97" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
      {/* dots at peaks */}
      <circle cx="75" cy="32" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="100" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="128" cy="80" r="3" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      {/* arrow up at peak */}
      <path d="M70 22 L75 12 L80 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ProjectionFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* megaphone */}
      <path d="M20 52 L20 88 L45 88 L80 108 L80 32 L45 52 Z" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinejoin="round" />
      {/* bell end */}
      <path d="M80 32 Q95 45 95 70 Q95 95 80 108" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* sound waves */}
      <path d="M100 52 Q114 62 114 70 Q114 78 100 88" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M108 42 Q126 56 126 70 Q126 84 108 98" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M116 32 Q136 50 136 70 Q136 90 116 108" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.25" />
      {/* handle */}
      <line x1="30" y1="88" x2="24" y2="110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

const FIGURES: Record<WarmupCategory, React.ReactNode> = {
  breathing:    <BreathingFigure />,
  physical:     <PhysicalFigure />,
  resonance:    <ResonanceFigure />,
  articulation: <ArticulationFigure />,
  pitch:        <PitchFigure />,
  projection:   <ProjectionFigure />,
};

export function WarmupItem({
  exercise,
  isPlaying,
  onTogglePlay,
  hasAdvanced,
}: {
  exercise: WarmupExercise;
  isPlaying: boolean;
  onTogglePlay: (e: React.MouseEvent) => void;
  hasAdvanced: boolean;
}) {
  const meta = CATEGORY_META[exercise.category];

  return (
    <motion.div
      key={exercise.id}
      initial={{ opacity: 0, filter: 'blur(12px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex flex-col items-center justify-center gap-5 pointer-events-none select-none px-8"
    >
      {/* sketch figure */}
      <div className="opacity-60">
        {FIGURES[exercise.category]}
      </div>

      {/* category pill */}
      <span className={`text-xs font-mono tracking-[0.18em] border rounded-full px-3 py-1 ${meta.color} ${meta.border}`}>
        {meta.label}
      </span>

      {/* title */}
      <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 text-center leading-tight">
        {exercise.title}
      </h2>

      {/* instruction */}
      <p className="text-base text-zinc-500 dark:text-zinc-400 text-center max-w-xs leading-relaxed">
        {exercise.instruction}
      </p>

      {/* play button */}
      <button
        onClick={onTogglePlay}
        className={`pointer-events-auto flex items-center gap-2 rounded-full px-5 py-2.5 mt-1 transition-all duration-300 ${
          isPlaying
            ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
        }`}
        style={{ filter: 'url(#sketch)' }}
        aria-label={isPlaying ? 'Stop audio' : 'Play instruction'}
      >
        {isPlaying
          ? <Square size={16} strokeWidth={2.5} />
          : <Play   size={16} strokeWidth={2.5} />}
        <span className="text-xs font-mono">{isPlaying ? 'stop' : 'play'}</span>
      </button>

      {/* tap hint */}
      {!hasAdvanced && (
        <p className="absolute bottom-20 text-xs text-zinc-300 dark:text-zinc-600 font-mono tracking-wide">
          tap anywhere to continue →
        </p>
      )}
    </motion.div>
  );
}
