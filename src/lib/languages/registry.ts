import type { Tip } from '../tips';
import type { Twister } from '../twisters';
import type { WarmupExercise } from '../warmup';

export type LanguageDirection = 'ltr' | 'rtl';
export type WordDifficulty = 'easy' | 'medium' | 'hard';
export type LanguageCode = 'en' | 'ar';

export interface LanguageLabels {
  nav: {
    words: string;
    twisters: string;
    warmup: string;
    tapMe: string;
  };
  settings: {
    title: string;
    preferences: string;
    language: string;
    tapToCycle: string;
    tapToClose: string;
    theme: string;
    themeLight: string;
    themeDark: string;
    sound: string;
    soundOn: string;
    soundOff: string;
    fontSize: string;
    wordsOnScreen: string;
    wordDisplay: string;
    wordCentered: string;
    wordRandom: string;
    timer: string;
    coachingTips: string;
    on: string;
    off: string;
    admin: string;
    dashboard: string;
  };
  about: {
    createdBy: string;
    bioSubtitle: string;
    appTagline: string;
    appDescription: string;
    bioText: string;
    tapToClose: string;
  };
  account: {
    title: string;
    syncCta: string;
    syncDescription: string;
    emailPlaceholder: string;
    continueWithEmail: string;
    continueWithGoogle: string;
    checkEmail: string;
    signedInAs: string;
    guest: string;
    signOut: string;
  };
  warmup: {
    tapToContinue: string;
    resetExercise: string;
    of: string;
    halfway: string;
    finalStretch: string;
    goingAgain: string;
    stop: string;
    play: string;
    catBreathing: string;
    catPhysical: string;
    catResonance: string;
    catArticulation: string;
    catPitch: string;
    catProjection: string;
  };
  tips: {
    vocal: string;
    framework: string;
    archetype: string;
    tapToDismiss: string;
    tryNow: string;
  };
  ui: {
    noTranscript: string;
  };
}

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: LanguageDirection;
  speechRecognitionCode: string;
  labels: LanguageLabels;
  generateWord: (opts?: { difficulty?: WordDifficulty }) => string;
  // Phase 2 content — undefined means fall back to English content
  twisters?: Twister[];
  warmupExercises?: WarmupExercise[];
  tips?: {
    vocal: Tip[];
    framework: Tip[];
    archetype: Tip[];
  };
}

const LANGUAGES: Record<string, LanguageConfig> = {};

export function registerLanguage(config: LanguageConfig): void {
  LANGUAGES[config.code] = config;
}

export function getLanguage(code: string): LanguageConfig {
  return LANGUAGES[code] ?? LANGUAGES['en'];
}

export function getAllLanguages(): LanguageConfig[] {
  return Object.values(LANGUAGES);
}
