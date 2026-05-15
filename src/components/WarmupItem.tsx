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

const svgBase = "text-zinc-400 dark:text-zinc-500";
const f = { filter: 'url(#sketch)' };

/* w001 — Box Breath: square with 4 arrows showing inhale→hold→exhale→hold cycle */
function Fig_w001() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      <rect x="32" y="32" width="76" height="76" stroke="currentColor" strokeWidth="2.5" rx="3" />
      {/* top arrow → IN */}
      <path d="M50 32 L90 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M84 27 L90 32 L84 37" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* right arrow ↓ HOLD */}
      <path d="M108 50 L108 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M103 84 L108 90 L113 84" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* bottom arrow ← OUT */}
      <path d="M90 108 L50 108" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M56 103 L50 108 L56 113" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* left arrow ↑ HOLD */}
      <path d="M32 90 L32 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M27 56 L32 50 L37 56" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* center dot */}
      <circle cx="70" cy="70" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* w002 — Hissing Exhale: profile face with long snake-like sss exhale stream */
function Fig_w002() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* head profile (facing right) */}
      <path d="M30 35 Q30 18 46 16 Q64 14 70 28 Q76 42 66 54 Q58 62 48 62 Q34 62 30 50 Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* nose bump */}
      <path d="M70 28 Q76 34 74 40" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* mouth open for exhale */}
      <path d="M62 46 Q68 44 70 47 Q68 52 62 52" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* neck + shoulder stub */}
      <path d="M42 62 L40 80 Q38 90 50 90" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* long sss exhale stream */}
      <path d="M70 48 Q82 44 92 48 Q102 52 112 48 Q122 44 130 48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M70 52 Q80 56 90 52 Q100 48 110 52 Q120 56 128 52" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.45" />
      {/* arrowhead at end */}
      <path d="M124 44 L130 48 L124 52" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

/* w003 — Sighing Release: torso raised (inhale) → shoulders drop + downward sigh wave */
function Fig_w003() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* head */}
      <circle cx="70" cy="22" r="13" stroke="currentColor" strokeWidth="2.5" />
      {/* neck */}
      <line x1="70" y1="35" x2="70" y2="48" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* shoulders raised (inhale) — high position */}
      <path d="M36 44 Q52 38 70 40 Q88 38 104 44" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* torso */}
      <path d="M46 50 Q42 78 44 108 L96 108 Q98 78 94 50 Q82 44 70 45 Q58 44 46 50Z" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* downward sigh arrow from shoulders */}
      <path d="M36 44 L30 62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M26 56 L30 62 L34 57" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
      <path d="M104 44 L110 62" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <path d="M106 57 L110 62 L114 57" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.6" />
      {/* sigh wave going down from mouth */}
      <path d="M70 36 Q66 46 70 56 Q74 66 70 76 Q66 86 70 96" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" strokeDasharray="3 3" />
    </svg>
  );
}

/* w004 — Lip Trills: front view of lips with motorboat flutter waves */
function Fig_w004() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* upper lip */}
      <path d="M30 58 Q45 48 60 54 Q70 50 80 54 Q95 48 110 58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* lower lip */}
      <path d="M30 58 Q35 75 70 78 Q105 75 110 58" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* cupid's bow detail */}
      <path d="M52 54 Q62 58 70 54 Q78 58 88 54" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" />
      {/* flutter waves between lips */}
      <path d="M34 58 Q42 52 50 58 Q58 64 66 58 Q74 52 82 58 Q90 64 98 58 Q104 54 108 58" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* air puff circles coming out */}
      <circle cx="55" cy="92"  r="5"  stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <circle cx="70" cy="100" r="7"  stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <circle cx="85" cy="90"  r="4"  stroke="currentColor" strokeWidth="1.5" opacity="0.55" />
      <circle cx="64" cy="114" r="9"  stroke="currentColor" strokeWidth="1.2" opacity="0.25" />
      <circle cx="82" cy="112" r="6"  stroke="currentColor" strokeWidth="1.2" opacity="0.25" />
    </svg>
  );
}

/* w005 — Neck Rolls: head with circular dashed rotation arrow */
function Fig_w005() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* neck + shoulders */}
      <line x1="70" y1="74" x2="70" y2="95" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M38 110 Q54 94 70 95 Q86 94 102 110" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* head tilted slightly */}
      <circle cx="72" cy="52" r="22" stroke="currentColor" strokeWidth="2.5" />
      {/* face features */}
      <circle cx="65" cy="48" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="79" cy="48" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M65 59 Q72 64 79 59" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* big circular dashed arrow going around the head */}
      <path d="M50 26 Q72 10 94 26 Q112 44 108 66 Q104 86 90 96"
        stroke="currentColor" strokeWidth="2.2" fill="none" strokeDasharray="5 3" strokeLinecap="round" opacity="0.65" />
      {/* arrowhead */}
      <path d="M90 96 L84 90 M90 96 L98 90" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" opacity="0.65" />
    </svg>
  );
}

/* w006 — Jaw Massage: face with fingertips at jaw hinges making circles */
function Fig_w006() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* face oval */}
      <ellipse cx="70" cy="62" rx="34" ry="42" stroke="currentColor" strokeWidth="2.5" />
      {/* eyes */}
      <circle cx="58" cy="52" r="3" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="82" cy="52" r="3" stroke="currentColor" strokeWidth="1.8" />
      {/* jaw dropped open */}
      <path d="M56 76 Q70 86 84 76" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M56 76 Q58 92 70 94 Q82 92 84 76" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* left hand fingers at jaw hinge */}
      <circle cx="36" cy="76" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M24 68 Q30 70 36 72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* right hand fingers at jaw hinge */}
      <circle cx="104" cy="76" r="5" stroke="currentColor" strokeWidth="2" />
      <path d="M116 68 Q110 70 104 72" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* small circular motion marks */}
      <path d="M28 76 Q32 70 38 72 Q44 76 40 82" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="3 2" />
      <path d="M112 76 Q108 70 102 72 Q96 76 100 82" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.5" strokeDasharray="3 2" />
    </svg>
  );
}

/* w007 — Tongue Stretch: open mouth with tongue extended very far out */
function Fig_w007() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* upper lip + jaw */}
      <path d="M22 46 Q46 38 70 42 Q94 38 118 46" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M22 46 Q24 62 70 66 Q116 62 118 46" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* teeth upper */}
      <path d="M36 46 L36 56 M52 44 L52 55 M68 43 L68 55 M84 43 L84 55 M100 44 L100 55 M114 46 L114 56"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      {/* tongue — extended far down, with rounded tip */}
      <path d="M54 60 Q70 56 86 60 Q90 80 90 100 Q90 128 70 130 Q50 128 50 100 Q50 80 54 60Z"
        stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* tongue center line */}
      <line x1="70" y1="60" x2="70" y2="120" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" />
      {/* "hold" tick marks */}
      <line x1="46" y1="108" x2="50" y2="108" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="90" y1="108" x2="94" y2="108" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

/* w008 — Chest Hum: torso with hand flat on chest + vibration rings */
function Fig_w008() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* torso */}
      <path d="M42 38 Q36 68 38 110 L102 110 Q104 68 98 38 Q84 30 70 31 Q56 30 42 38Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* neckline */}
      <path d="M56 31 Q70 24 84 31" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* arm coming across chest */}
      <path d="M38 56 Q52 50 70 52 Q84 50 96 56" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
      {/* hand flat on chest */}
      <path d="M48 62 Q70 56 90 62 Q92 72 70 74 Q48 72 48 62Z" stroke="currentColor" strokeWidth="2.2" fill="none" />
      {/* vibration rings from chest */}
      <path d="M38 76 Q24 86 38 96" stroke="currentColor" strokeWidth="2.2"  fill="none" strokeLinecap="round" opacity="0.75" />
      <path d="M30 70 Q12 84 30 102" stroke="currentColor" strokeWidth="1.6"  fill="none" strokeLinecap="round" opacity="0.45" />
      <path d="M22 64 Q0 82 22 108"  stroke="currentColor" strokeWidth="1.2"  fill="none" strokeLinecap="round" opacity="0.2" />
      {/* closed lips = humming */}
      <path d="M58 18 Q70 14 82 18 Q70 22 58 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

/* w009 — Mmm-Bah: two mouth states side by side (closed→burst open) */
function Fig_w009() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* left face: closed lips (mmm) */}
      <circle cx="36" cy="60" r="28" stroke="currentColor" strokeWidth="2.5" />
      <path d="M22 64 Q36 60 50 64" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* mmm vibration line */}
      <path d="M18 72 Q24 68 30 72 Q36 76 42 72 Q48 68 54 72" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* arrow between */}
      <path d="M68 60 L82 60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M77 54 L83 60 L77 66" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* right face: open BAH mouth */}
      <circle cx="110" cy="60" r="28" stroke="currentColor" strokeWidth="2.5" />
      {/* wide open mouth */}
      <path d="M94 58 Q100 52 110 54 Q120 52 126 58 Q126 76 110 78 Q94 76 94 58Z" stroke="currentColor" strokeWidth="2.2" fill="none" />
      {/* pop burst lines */}
      <line x1="110" y1="22" x2="110" y2="30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <line x1="130" y1="30" x2="124" y2="36" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
      <line x1="136" y1="52" x2="128" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/* w010 — Yawn Sigh: comically huge yawning mouth + downward sigh wave */
function Fig_w010() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* upper face hint */}
      <path d="M20 36 Q70 28 120 36" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4" />
      {/* squinting eyes (yawning) */}
      <path d="M36 38 Q44 34 52 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      <path d="M88 38 Q96 34 104 38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
      {/* huge yawning mouth */}
      <path d="M18 52 Q44 44 70 48 Q96 44 122 52 Q124 96 70 102 Q16 96 18 52Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* upper lip curve */}
      <path d="M18 52 Q44 62 70 58 Q96 62 122 52" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
      {/* uvula */}
      <path d="M70 66 Q68 76 70 80 Q72 76 70 66" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="70" cy="82" r="4" stroke="currentColor" strokeWidth="2" />
      {/* downward sigh wave */}
      <path d="M70 102 Q66 112 70 120 Q74 128 70 136" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.55" strokeDasharray="4 3" />
      <path d="M65 132 L70 137 L75 132" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.55" />
    </svg>
  );
}

/* w011 — Lip Bubbles (motorboat): lips vibrating with bubbles + brrr waves */
function Fig_w011() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* lips — fuller, relaxed */}
      <path d="M24 54 Q42 44 60 50 Q70 46 80 50 Q98 44 116 54" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M24 54 Q28 70 70 74 Q112 70 116 54" stroke="currentColor" strokeWidth="3" fill="none" />
      {/* multiple rapid flutter waves between */}
      <path d="M28 54 Q36 48 44 54 Q52 60 60 54 Q68 48 76 54 Q84 60 92 54 Q100 48 108 54 Q112 58 116 54"
        stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.8" />
      <path d="M28 56 Q36 50 44 56 Q52 62 60 56 Q68 50 76 56 Q84 62 92 56 Q100 50 108 56"
        stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
      {/* bubbles floating out forward */}
      <circle cx="50"  cy="88" r="6"  stroke="currentColor" strokeWidth="1.8" opacity="0.6" />
      <circle cx="70"  cy="96" r="8"  stroke="currentColor" strokeWidth="1.8" opacity="0.5" />
      <circle cx="90"  cy="86" r="5"  stroke="currentColor" strokeWidth="1.8" opacity="0.6" />
      <circle cx="60"  cy="110" r="10" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="84"  cy="108" r="7"  stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="100" cy="120" r="12" stroke="currentColor" strokeWidth="1.2" opacity="0.18" />
    </svg>
  );
}

/* w012 — Ba Da Ga: three progressive pop bursts (front teeth → tongue tip → throat) */
function Fig_w012() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* BA burst — left, smallest */}
      <circle cx="28" cy="70" r="18" stroke="currentColor" strokeWidth="2" />
      <line x1="28" y1="46" x2="28" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="54" x2="50" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="50" y1="70" x2="58" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="44" y1="86" x2="50" y2="92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="94" x2="28" y2="102" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* DA burst — center, medium */}
      <circle cx="70" cy="70" r="22" stroke="currentColor" strokeWidth="2.2" />
      <line x1="70" y1="42" x2="70" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="92" y1="56" x2="100" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="96" y1="78" x2="106" y2="82" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="70" y1="98" x2="70" y2="108" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <line x1="48" y1="56" x2="40" y2="48" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* GA burst — right, largest */}
      <circle cx="116" cy="70" r="18" stroke="currentColor" strokeWidth="2.5" />
      <line x1="116" y1="46" x2="116" y2="36" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="130" y1="54" x2="136" y2="48" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="134" y1="70" x2="140" y2="70" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="130" y1="86" x2="136" y2="92" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="116" y1="94" x2="116" y2="104" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <line x1="102" y1="54" x2="96" y2="48" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      {/* faster arrow under */}
      <path d="M20 118 L120 118" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" strokeDasharray="4 2" />
      <path d="M114 113 L120 118 L114 123" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4" />
    </svg>
  );
}

/* w013 — Red Lorry / Yellow Lorry: two simple side-profile trucks */
function Fig_w013() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* lorry 1 — top */}
      {/* cabin */}
      <rect x="10" y="28" width="28" height="26" rx="3" stroke="currentColor" strokeWidth="2.2" />
      {/* windscreen */}
      <path d="M14 28 Q14 20 22 20 L34 20 L38 28" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* trailer */}
      <rect x="38" y="28" width="60" height="26" rx="2" stroke="currentColor" strokeWidth="2.2" />
      {/* wheels */}
      <circle cx="22" cy="58" r="8" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="22" cy="58" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="68" cy="58" r="8" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="68" cy="58" r="3" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="88" cy="58" r="8" stroke="currentColor" strokeWidth="2.2" />
      <circle cx="88" cy="58" r="3" stroke="currentColor" strokeWidth="1.5" />

      {/* lorry 2 — bottom, slightly offset / different proportion */}
      <rect x="20" y="88" width="26" height="24" rx="3" stroke="currentColor" strokeWidth="2" />
      <path d="M24 88 Q24 80 32 80 L42 80 L46 88" stroke="currentColor" strokeWidth="1.8" fill="none" />
      <rect x="46" y="84" width="58" height="28" rx="2" stroke="currentColor" strokeWidth="2" />
      <circle cx="32"  cy="116" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="32"  cy="116" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="74"  cy="116" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="74"  cy="116" r="2.5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="94"  cy="116" r="7" stroke="currentColor" strokeWidth="2" />
      <circle cx="94"  cy="116" r="2.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

/* w014 — Lah Lah Lah: tongue tip rapidly hitting the alveolar ridge (behind top teeth) */
function Fig_w014() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* open mouth — jaw stays STILL */}
      <path d="M16 46 Q44 38 70 42 Q96 38 124 46 Q124 90 70 96 Q16 90 16 46Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* upper lip */}
      <path d="M16 46 Q44 56 70 52 Q96 56 124 46" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
      {/* alveolar ridge (spot behind top teeth) */}
      <path d="M36 52 Q70 44 104 52" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
      {/* teeth */}
      <path d="M36 52 L36 60 M52 50 L52 59 M68 49 L68 59 M84 49 L84 59 M100 50 L100 59 M116 52 L116 60"
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
      {/* tongue body - stays back */}
      <path d="M40 82 Q70 76 100 82 Q100 90 70 92 Q40 90 40 82Z" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* tongue tip rapid positions hitting ridge */}
      <path d="M60 76 Q70 52 80 76" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M56 76 Q70 46 84 76" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.45" />
      <path d="M52 76 Q70 42 88 76" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.2" />
      {/* tip dot hitting ridge */}
      <circle cx="70" cy="52" r="4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

/* w015 — Siren: voice sweeping from lowest to highest like a police siren */
function Fig_w015() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* siren light on top */}
      <rect x="56" y="8" width="28" height="16" rx="4" stroke="currentColor" strokeWidth="2.2" />
      <path d="M50 8 Q70 2 90 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* rotating flash lines */}
      <line x1="70" y1="2"  x2="70" y2="8"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="86" y1="4"  x2="84" y2="8"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      <line x1="54" y1="4"  x2="56" y2="8"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
      {/* voice sweep wave: starts low left, sweeps up to peak, comes back down */}
      <path d="M8 116 Q20 110 30 98 Q42 84 54 68 Q64 52 70 34 Q76 52 86 68 Q98 84 110 98 Q120 110 132 116"
        stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* second echo wave */}
      <path d="M8 124 Q22 118 34 106 Q46 92 58 76 Q66 62 70 46 Q74 62 82 76 Q94 92 106 106 Q118 118 132 124"
        stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
      {/* peak dot */}
      <circle cx="70" cy="34" r="5" stroke="currentColor" strokeWidth="2.2" />
      {/* low points */}
      <circle cx="8"   cy="116" r="3.5" stroke="currentColor" strokeWidth="1.8" opacity="0.55" />
      <circle cx="132" cy="116" r="3.5" stroke="currentColor" strokeWidth="1.8" opacity="0.55" />
    </svg>
  );
}

/* w016 — Five Tones: 5 notes ascending then descending on a gentle arc */
function Fig_w016() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* arc path the notes follow */}
      <path d="M14 96 Q36 70 70 50 Q104 70 126 96"
        stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" strokeDasharray="4 3" />
      {/* note 1 — mah — lowest left */}
      <ellipse cx="14" cy="96" rx="7" ry="5" transform="rotate(-15 14 96)" stroke="currentColor" strokeWidth="2" />
      <line x1="20" y1="93" x2="20" y2="74" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* note 2 — may */}
      <ellipse cx="37" cy="76" rx="7" ry="5" transform="rotate(-15 37 76)" stroke="currentColor" strokeWidth="2" />
      <line x1="43" y1="73" x2="43" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* note 3 — mee — highest center */}
      <ellipse cx="70" cy="50" rx="7" ry="5" transform="rotate(-15 70 50)" stroke="currentColor" strokeWidth="2.5" />
      <line x1="76" y1="47" x2="76" y2="26" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* note 4 — moh */}
      <ellipse cx="103" cy="76" rx="7" ry="5" transform="rotate(-15 103 76)" stroke="currentColor" strokeWidth="2" />
      <line x1="109" y1="73" x2="109" y2="54" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* note 5 — moo — back to low right */}
      <ellipse cx="126" cy="96" rx="7" ry="5" transform="rotate(-15 126 96)" stroke="currentColor" strokeWidth="2" />
      <line x1="132" y1="93" x2="132" y2="74" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      {/* connecting arrow under suggesting scale up then down */}
      <path d="M14 118 Q70 108 126 118" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" />
    </svg>
  );
}

/* w017 — Octave Jump: low note with large curved leap arrow to high note */
function Fig_w017() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* low note — left */}
      <ellipse cx="26" cy="106" rx="10" ry="7" transform="rotate(-15 26 106)" stroke="currentColor" strokeWidth="2.5" />
      <line x1="35" y1="101" x2="35" y2="72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* high note — right */}
      <ellipse cx="114" cy="38" rx="10" ry="7" transform="rotate(-15 114 38)" stroke="currentColor" strokeWidth="2.5" />
      <line x1="123" y1="33" x2="123" y2="4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* flag on high note */}
      <path d="M123 4 Q134 8 134 16 Q134 22 123 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* big curved leap arrow */}
      <path d="M36 88 Q70 20 108 42" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeDasharray="6 4" />
      <path d="M102 36 L108 42 L104 50" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* down return arrow (smaller, faded) */}
      <path d="M106 56 Q70 110 38 100" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.35" strokeDasharray="4 3" />
      <path d="M44 106 L38 100 L46 96" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.35" />
    </svg>
  );
}

/* w018 — Ha Ha Ha: three sharp bursts from belly/diaphragm, NOT from throat */
function Fig_w018() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* torso outline */}
      <path d="M44 18 Q38 50 40 110 L100 110 Q102 50 96 18 Q82 10 70 11 Q58 10 44 18Z" stroke="currentColor" strokeWidth="2.5" fill="none" />
      {/* neckline */}
      <path d="M56 18 Q70 12 84 18" stroke="currentColor" strokeWidth="2" fill="none" />
      {/* diaphragm line */}
      <path d="M40 62 Q70 54 100 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" strokeDasharray="5 3" opacity="0.6" />
      {/* three HA bursts from belly */}
      <path d="M40 76 Q28 66 20 60" stroke="currentColor" strokeWidth="3" strokeLinecap="round" fill="none" />
      <path d="M20 54 L18 62 L26 62" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M40 82 Q24 78 14 76" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M14 70 L12 78 L20 78" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M40 90 Q26 90 14 92" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M14 86 L12 94 L20 94" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      {/* X over throat to show NOT from throat */}
      <line x1="60" y1="10" x2="70" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
      <line x1="70" y1="10" x2="60" y2="20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.45" />
    </svg>
  );
}

/* w019 — Count Across the Room: two figures far apart, numbers + waves traveling */
function Fig_w019() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* speaker figure — left */}
      <circle cx="18" cy="36" r="10" stroke="currentColor" strokeWidth="2.2" />
      <line   x1="18" y1="46" x2="18" y2="72" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      <path   d="M18 56 Q10 52 6 48"  stroke="currentColor" strokeWidth="2"   strokeLinecap="round" fill="none" />
      <path   d="M18 56 Q26 52 30 48" stroke="currentColor" strokeWidth="2"   strokeLinecap="round" fill="none" />
      <path   d="M10 72 Q14 88 12 98" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      <path   d="M26 72 Q22 88 24 98" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" fill="none" />
      {/* voice waves going right */}
      <path d="M30 48 Q44 42 56 48 Q44 54 30 48" stroke="currentColor" strokeWidth="2"   fill="none" opacity="0.85" />
      <path d="M30 42 Q48 32 64 40 Q48 56 30 56" stroke="currentColor" strokeWidth="1.6" fill="none" opacity="0.55" />
      <path d="M30 36 Q52 22 72 34 Q52 58 30 62" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.3" />
      {/* 1 2 3 number hints traveling */}
      <circle cx="78" cy="46" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.6" />
      <circle cx="92" cy="46" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />
      <circle cx="106" cy="46" r="4" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      {/* listener figure — right, far away */}
      <circle cx="126" cy="36" r="8" stroke="currentColor" strokeWidth="2" />
      <line   x1="126" y1="44" x2="126" y2="66" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path   d="M118 66 Q122 80 120 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path   d="M134 66 Q130 80 132 90" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* distance indicator */}
      <line x1="34" y1="108" x2="118" y2="108" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.3" strokeDasharray="4 3" />
    </svg>
  );
}

/* w020 — Good Morning: figure standing tall, sunrise, bold voice projection */
function Fig_w020() {
  return (
    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" className={svgBase} style={f}>
      {/* sun rising */}
      <path d="M20 50 Q70 10 120 50" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.45" />
      <circle cx="70" cy="22" r="12" stroke="currentColor" strokeWidth="2.2" opacity="0.6" />
      <line x1="70" y1="6"  x2="70" y2="2"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="86" y1="10" x2="88" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="54" y1="10" x2="52" y2="6"  stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="94" y1="20" x2="98" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <line x1="46" y1="20" x2="42" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      {/* standing figure — tall, proud posture */}
      <circle cx="70" cy="56" r="11" stroke="currentColor" strokeWidth="2.5" />
      <line x1="70" y1="67" x2="70" y2="100" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* arms open wide — confident stance */}
      <path d="M70 76 Q56 70 44 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M70 76 Q84 70 96 72" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <line x1="70" y1="100" x2="58" y2="126" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="70" y1="100" x2="82" y2="126" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      {/* big projection waves from mouth level */}
      <path d="M80 60 Q92 52 100 60 Q92 68 80 60" stroke="currentColor" strokeWidth="2.2" fill="none" opacity="0.9" />
      <path d="M80 54 Q96 42 108 54 Q96 74 80 66" stroke="currentColor" strokeWidth="1.8" fill="none" opacity="0.6" />
      <path d="M80 48 Q100 32 116 48 Q100 80 80 72" stroke="currentColor" strokeWidth="1.4" fill="none" opacity="0.35" />
    </svg>
  );
}

const EXERCISE_FIGURES: Record<string, React.ReactNode> = {
  w001: <Fig_w001 />,
  w002: <Fig_w002 />,
  w003: <Fig_w003 />,
  w004: <Fig_w004 />,
  w005: <Fig_w005 />,
  w006: <Fig_w006 />,
  w007: <Fig_w007 />,
  w008: <Fig_w008 />,
  w009: <Fig_w009 />,
  w010: <Fig_w010 />,
  w011: <Fig_w011 />,
  w012: <Fig_w012 />,
  w013: <Fig_w013 />,
  w014: <Fig_w014 />,
  w015: <Fig_w015 />,
  w016: <Fig_w016 />,
  w017: <Fig_w017 />,
  w018: <Fig_w018 />,
  w019: <Fig_w019 />,
  w020: <Fig_w020 />,
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
      <div className="opacity-75">
        {EXERCISE_FIGURES[exercise.id]}
      </div>

      <span className={`text-xs font-mono tracking-[0.18em] border rounded-full px-3 py-1 ${meta.color} ${meta.border}`}>
        {meta.label}
      </span>

      <h2 className="text-4xl font-black text-zinc-900 dark:text-zinc-50 text-center leading-tight">
        {exercise.title}
      </h2>

      <p className="text-base text-zinc-500 dark:text-zinc-400 text-center max-w-xs leading-relaxed">
        {exercise.instruction}
      </p>

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

      {!hasAdvanced && (
        <p className="absolute bottom-20 text-xs text-zinc-300 dark:text-zinc-600 font-mono tracking-wide">
          tap anywhere to continue →
        </p>
      )}
    </motion.div>
  );
}
