export type TipCategory = 'vocal' | 'framework' | 'archetype';

export type Tip = {
  label: string;
  category: TipCategory;
  title: string;
  description: string;
  example: string;
  instruction: string;
};

export const vocalTips: Tip[] = [
  {
    label: 'PAUSE',
    category: 'vocal',
    title: 'The Pause',
    description: 'Space after a key word carries more weight than the word itself.',
    example: '"She sells… [pause] seashells… [pause] by the seashore."',
    instruction: 'Say the word, stop completely for 1 second. Let it land before moving on.',
  },
  {
    label: 'SLOW DOWN',
    category: 'vocal',
    title: 'Rate of Speech',
    description: 'The more important the point, the slower you go.',
    example: '"This… is… the most important thing I will say."',
    instruction: 'Say each syllable deliberately. No rushing.',
  },
  {
    label: 'LOUDER',
    category: 'vocal',
    title: 'Volume',
    description: 'Volume is confidence made audible. +2 notches projects authority.',
    example: '"I believe this." (50%) vs "I BELIEVE this." (90%)',
    instruction: 'Say the word at half volume, then again at full. Feel the difference.',
  },
  {
    label: 'SING IT',
    category: 'vocal',
    title: 'Pitch & Melody',
    description: 'Monotone loses people. Let your pitch rise and fall like music.',
    example: '"Isn\'t this ↗ incredible ↘" — rise on the peak, fall to land.',
    instruction: 'Say the word with your pitch going up on the first half, down on the second.',
  },
  {
    label: 'FEEL IT',
    category: 'vocal',
    title: 'Tonality',
    description: 'Your face is the remote control for your voice. Expression drives emotion.',
    example: 'Say "brilliant" warmly. Now say it sarcastically. Same word, different world.',
    instruction: 'Pick an emotion — warm, curious, firm — and say the word from that place.',
  },
];

export const frameworkTips: Tip[] = [
  {
    label: 'PEP',
    category: 'framework',
    title: 'Point → Example → Point',
    description: 'The clearest structure for any spoken idea.',
    example: '"Practice matters. [Athletes rehearse for years.] That\'s why practice matters."',
    instruction: 'Make your point using this word, give one example, then restate the point.',
  },
  {
    label: '3-2-1',
    category: 'framework',
    title: '3-2-1 Speaking Trick',
    description: 'When put on the spot: pick 3 steps, 2 types, or the 1 thing.',
    example: '"There are 3 ways to look at this: sound, meaning, and feeling."',
    instruction: 'Use this word as your topic. Speak for 30 seconds using "3 steps" as your frame.',
  },
  {
    label: 'STORY',
    category: 'framework',
    title: 'Incident → Point → Link',
    description: 'All great stories have three parts: what happened, what it means, why it matters to you.',
    example: '"I mispronounced a word in a meeting once. [incident] Words shape perception. [point] That\'s why we practice. [link]"',
    instruction: 'Tell a 20-second story using this word as the trigger.',
  },
  {
    label: '5-PART',
    category: 'framework',
    title: '5-Part Structure',
    description: 'Intro 12.5% → Point A 25% → Point B 25% → Point C 25% → Close 12.5%.',
    example: 'Open with a hook, deliver three clear beats, close by returning to the hook.',
    instruction: 'Plan a 60-second response using this structure. Say it out loud now.',
  },
];

export const archetypeTips: Tip[] = [
  {
    label: 'MOTIVATOR',
    category: 'archetype',
    title: 'The Motivator',
    description: 'High energy. Flowing. You\'re creating a sense of possibility.',
    example: '"This word — this single word — can change how someone sees you forever."',
    instruction: 'Say the word like you\'re inspiring a crowd. Let the energy build.',
  },
  {
    label: 'EDUCATOR',
    category: 'archetype',
    title: 'The Educator',
    description: 'Slower. Matter-of-fact. You\'re delivering insight with precision.',
    example: '"Notice where your tongue lands on each syllable. That\'s articulation."',
    instruction: 'Say the word like you\'re teaching it for the first time. Deliberate.',
  },
  {
    label: 'COACH',
    category: 'archetype',
    title: 'The Coach',
    description: 'Short. Punchy. Assertive. You\'re pushing someone to do better.',
    example: '"Again. Louder. Own it."',
    instruction: 'Say the word like a command. Direct, no softening.',
  },
  {
    label: 'FRIEND',
    category: 'archetype',
    title: 'The Friend',
    description: 'Conversational. Warm. Melodic. You\'re connecting, not performing.',
    example: '"You know what\'s funny about this word? It sounds exactly like what it means."',
    instruction: 'Say the word like you\'re sharing it with someone you trust. Relaxed, real.',
  },
];
