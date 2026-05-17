export type AchievementCounters = {
  words: number;
  twisters: number;
  warmupExercises: number;
  fullWarmups: number;
  recordings: number;
  tipsViewed: string[];
};

export const DEFAULT_COUNTERS: AchievementCounters = {
  words: 0,
  twisters: 0,
  warmupExercises: 0,
  fullWarmups: 0,
  recordings: 0,
  tipsViewed: [],
};

export type Achievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (counters: AchievementCounters) => boolean;
};

export const ACHIEVEMENTS: Achievement[] = [
  // Words
  { id: 'first_word',          title: 'First Word',          description: 'Generate your first word',          icon: '✦', check: c => c.words >= 1 },
  { id: 'word_collector',      title: 'Word Collector',      description: 'Generate 10 words',                 icon: '✦', check: c => c.words >= 10 },
  { id: 'vocabulary_builder',  title: 'Vocabulary Builder',  description: 'Generate 50 words',                 icon: '✦', check: c => c.words >= 50 },
  { id: 'word_master',         title: 'Word Master',         description: 'Generate 100 words',                icon: '✦', check: c => c.words >= 100 },
  // Twisters
  { id: 'twisted',             title: 'Twisted',             description: 'Practice a tongue twister',         icon: '✦', check: c => c.twisters >= 1 },
  { id: 'twister_fan',         title: 'Twister Fan',         description: 'Practice 5 tongue twisters',        icon: '✦', check: c => c.twisters >= 5 },
  { id: 'twister_addict',      title: 'Twister Addict',      description: 'Practice 15 tongue twisters',       icon: '✦', check: c => c.twisters >= 15 },
  { id: 'twister_master',      title: 'Twister Master',      description: 'Practice 30 tongue twisters',       icon: '✦', check: c => c.twisters >= 30 },
  // Warmup
  { id: 'warmed_up',           title: 'Warmed Up',           description: 'Do your first warmup exercise',     icon: '✦', check: c => c.warmupExercises >= 1 },
  { id: 'morning_ready',       title: 'Morning Ready',       description: 'Complete a full warmup routine',    icon: '✦', check: c => c.fullWarmups >= 1 },
  { id: 'dedicated',           title: 'Dedicated',           description: 'Complete 3 full warmup routines',   icon: '✦', check: c => c.fullWarmups >= 3 },
  // Recordings
  { id: 'first_take',          title: 'First Take',          description: 'Make your first recording',         icon: '✦', check: c => c.recordings >= 1 },
  { id: 'getting_there',       title: 'Getting There',       description: 'Make 5 recordings',                 icon: '✦', check: c => c.recordings >= 5 },
  { id: 'committed',           title: 'Committed',           description: 'Make 10 recordings',                icon: '✦', check: c => c.recordings >= 10 },
  // Tips
  { id: 'tip_seeker',          title: 'Tip Seeker',          description: 'Open your first coaching tip',      icon: '✦', check: c => c.tipsViewed.length >= 1 },
  { id: 'archetype_explorer',  title: 'Archetype Explorer',  description: 'Explore all 4 speaking archetypes', icon: '✦', check: c => ['MOTIVATOR','EDUCATOR','COACH','FRIEND'].every(l => c.tipsViewed.includes(l)) },
  { id: 'vocal_coach',         title: 'Vocal Coach',         description: 'View all 13 coaching tips',         icon: '✦', check: c => c.tipsViewed.length >= 13 },
];

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;
