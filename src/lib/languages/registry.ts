import type { Twister } from '../twisters';
import type { WarmupExercise } from '../warmup';

export type LanguageDirection = 'ltr' | 'rtl';
export type WordDifficulty = 'easy' | 'medium' | 'hard';
export type LanguageCode = 'en' | 'ar';

export interface LanguageConfig {
  code: string;
  name: string;
  nativeName: string;
  direction: LanguageDirection;
  speechRecognitionCode: string;
  labels: {
    words: string;
    twisters: string;
    warmup: string;
    tapMe: string;
  };
  generateWord: (opts?: { difficulty?: WordDifficulty }) => string;
  // Phase 2 placeholders — undefined means fall back to English content
  twisters?: Twister[];
  warmupExercises?: WarmupExercise[];
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
