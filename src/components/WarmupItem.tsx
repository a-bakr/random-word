'use client';

import { Play, Square } from 'lucide-react';
import { motion } from 'motion/react';
import type { WarmupExercise, WarmupCategory } from '../lib/warmup';

const CATEGORY_META: Record<WarmupCategory, { label: string; color: string; border: string }> = {
  breathing:    { label: '🌬 BREATHE',     color: 'text-sky-500 dark:text-sky-400',         border: 'border-sky-300 dark:border-sky-700' },
  physical:     { label: '💪 STRETCH',     color: 'text-orange-500 dark:text-orange-400',   border: 'border-orange-300 dark:border-orange-700' },
  resonance:    { label: '🎵 RESONATE',    color: 'text-violet-500 dark:text-violet-400',   border: 'border-violet-300 dark:border-violet-700' },
  articulation: { label: '👅 ARTICULATE',  color: 'text-emerald-500 dark:text-emerald-400', border: 'border-emerald-300 dark:border-emerald-700' },
  pitch:        { label: '🎼 PITCH',       color: 'text-amber-500 dark:text-amber-400',     border: 'border-amber-300 dark:border-amber-700' },
  projection:   { label: '📢 PROJECT',     color: 'text-rose-500 dark:text-rose-400',       border: 'border-rose-300 dark:border-rose-700' },
};

/* Lungs filling with air — trachea, two lung lobes, rising bubbles */
function BreathingFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* trachea */}
      <line x1="70" y1="12" x2="70" y2="42" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* bronchi */}
      <path d="M70 42 Q56 46 46 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M70 42 Q84 46 94 54" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* left lung lobe */}
      <path d="M46 54 Q22 68 26 92 Q30 118 52 122 Q68 124 68 106 Q62 82 70 42" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* right lung lobe */}
      <path d="M94 54 Q118 68 114 92 Q110 118 88 122 Q72 124 72 106 Q78 82 70 42" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* air bubbles rising */}
      <circle cx="70" cy="6"  r="3"   stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
      <circle cx="62" cy="2"  r="2"   stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="78" cy="2"  r="2"   stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* ribs suggestion */}
      <path d="M36 74 Q54 70 68 72" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35" />
      <path d="M36 84 Q54 80 68 82" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35" />
      <path d="M104 74 Q86 70 72 72" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35" />
      <path d="M104 84 Q86 80 72 82" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.35" />
    </svg>
  );
}

/* Head with circular neck-roll arrow and loose jaw */
function PhysicalFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* neck */}
      <line x1="70" y1="68" x2="70" y2="90" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* shoulders */}
      <path d="M40 110 Q55 90 70 90 Q85 90 100 110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* head circle */}
      <circle cx="70" cy="48" r="22" stroke="currentColor" strokeWidth="2.5" />
      {/* jaw open / relaxed */}
      <path d="M53 58 Q70 72 87 58" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* circular roll arrow around head */}
      <path d="M48 26 Q70 10 92 26 Q108 42 100 62" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" strokeDasharray="4 3" />
      {/* arrowhead */}
      <path d="M100 62 L95 54 M100 62 L108 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.55" />
    </svg>
  );
}

/* Torso with hum vibrations radiating from chest */
function ResonanceFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* head */}
      <circle cx="70" cy="22" r="14" stroke="currentColor" strokeWidth="2.5" />
      {/* humming mouth — closed smile */}
      <path d="M63 26 Q70 30 77 26" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* neck */}
      <line x1="70" y1="36" x2="70" y2="52" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* torso */}
      <path d="M46 52 Q38 80 42 112 L98 112 Q102 80 94 52 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* hand on chest */}
      <path d="M56 72 Q62 68 70 70 Q78 68 84 72" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* vibration rings from chest */}
      <path d="M50 78 Q38 88 50 98" stroke="currentColor" strokeWidth="2"   fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M42 72 Q24 86 42 102" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.5" />
      <path d="M34 66 Q12 84 34 106" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
    </svg>
  );
}

/* Big open mouth, tongue flicking rapidly (motion lines on tongue tip) */
function ArticulationFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* upper lip */}
      <path d="M18 52 Q44 44 70 48 Q96 44 122 52" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* lower lip */}
      <path d="M18 52 Q20 90 70 98 Q120 90 122 52" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* teeth top */}
      <path d="M30 54 L30 66 M46 52 L46 65 M62 51 L62 64 M78 51 L78 64 M94 52 L94 65 M110 54 L110 66" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      {/* tongue body */}
      <path d="M44 78 Q70 72 96 78 Q96 96 70 100 Q44 96 44 78Z" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* tongue tip in motion — multiple ghost positions */}
      <path d="M70 100 Q62 120 70 128 Q78 120 70 100" stroke="currentColor" strokeWidth="2.5" fill="none" />
      <path d="M70 100 Q58 118 66 126" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M70 100 Q82 118 74 126" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      {/* motion speed lines near tip */}
      <line x1="56" y1="122" x2="50" y2="124" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
      <line x1="84" y1="122" x2="90" y2="124" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/* Sine wave rising from low (left) to high (right) with a musical note at the peak */
function PitchFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* baseline */}
      <line x1="10" y1="105" x2="130" y2="105" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.25" />
      {/* the rising siren wave */}
      <path d="M10 98 Q22 90 30 82 Q38 72 48 62 Q60 48 72 36 Q80 26 90 36 Q100 46 108 58 Q116 70 122 82 Q128 92 130 100"
        stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      {/* faint second echo wave */}
      <path d="M10 108 Q22 100 30 92 Q38 82 48 72 Q60 58 72 48 Q80 40 90 48 Q100 58 108 70 Q116 82 122 94"
        stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.3" />
      {/* musical note at peak */}
      <ellipse cx="72" cy="36" rx="6" ry="4.5" transform="rotate(-20 72 36)" stroke="currentColor" strokeWidth="2" />
      <line x1="77" y1="33" x2="77" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M77 14 Q88 18 88 24" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* low note at start */}
      <ellipse cx="16" cy="98" rx="5" ry="3.5" transform="rotate(-20 16 98)" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <line x1="20" y1="96" x2="20" y2="82" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* Side-profile figure projecting voice — open mouth with expanding fan of sound waves */
function ProjectionFigure() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className="text-zinc-400 dark:text-zinc-500" style={{ filter: 'url(#sketch)' }}>
      {/* head profile */}
      <path d="M30 30 Q30 14 44 12 Q62 10 66 24 Q70 36 62 46 Q56 52 48 52 Q36 52 30 44 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* open mouth on profile */}
      <path d="M62 38 Q70 36 72 40 Q70 46 62 44" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* neck + body suggestion */}
      <line x1="48" y1="52" x2="46" y2="70" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M32 70 Q46 66 60 70 Q62 90 58 110 L36 110 Q32 90 32 70Z" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* sound waves fanning out from mouth */}
      <path d="M72 36 Q86 30 96 36 Q86 42 72 42" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.9" />
      <path d="M72 32 Q92 22 106 30 Q92 46 72 46" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.65" />
      <path d="M72 26 Q96 12 116 24 Q96 52 72 52" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
      <path d="M72 20 Q100 4 124 18 Q100 58 72 58" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.2" />
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
      <div className="opacity-70">
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

      {/* play button — larger */}
      <button
        onClick={onTogglePlay}
        className={`pointer-events-auto flex items-center gap-3 rounded-full px-6 py-3 mt-1 transition-all duration-300 ${
          isPlaying
            ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800'
            : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50'
        }`}
        style={{ filter: 'url(#sketch)' }}
        aria-label={isPlaying ? 'Stop audio' : 'Play instruction'}
      >
        {isPlaying
          ? <Square size={22} strokeWidth={2.5} />
          : <Play   size={22} strokeWidth={2.5} />}
        <span className="text-sm font-mono">{isPlaying ? 'stop' : 'play'}</span>
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
