export type WarmupCategory = 'breathing' | 'physical' | 'resonance' | 'articulation' | 'pitch' | 'projection';

export interface WarmupExercise {
  id: string;
  category: WarmupCategory;
  title: string;
  instruction: string;
  example?: string;
}

export const WARMUP_EXERCISES: WarmupExercise[] = [
  { id: 'w001', category: 'breathing',    title: 'Box Breath',             instruction: 'Breathe in for 4 counts. Hold for 4. Out for 4. Hold for 4. Feel your belly expand.' },
  { id: 'w002', category: 'breathing',    title: 'Hissing Exhale',         instruction: 'Inhale deeply, then exhale slowly on a long ssssss. Make it last 10 seconds.' },
  { id: 'w003', category: 'breathing',    title: 'Sighing Release',        instruction: 'Take a huge inhale, then sigh it all out on ahhhhh. Let everything drop.' },
  { id: 'w004', category: 'breathing',    title: 'Lip Trills',             instruction: 'Blow air through loose relaxed lips to make them flutter. Keep your jaw soft.' },
  { id: 'w005', category: 'physical',     title: 'Neck Rolls',             instruction: 'Slowly roll your head in a wide circle, one direction then the other. Feel the stretch.' },
  { id: 'w006', category: 'physical',     title: 'Jaw Massage',            instruction: 'Place your fingertips on your jaw hinges and make slow circles. Let your mouth hang open.' },
  { id: 'w007', category: 'physical',     title: 'Tongue Stretch',         instruction: 'Stick your tongue out as far as it will go. Hold for 3 seconds, then pull it back. Repeat.' },
  { id: 'w008', category: 'resonance',    title: 'Chest Hum',              instruction: 'Hum a low comfortable note. Feel the buzz in your chest. Place a hand there to feel it.' },
  { id: 'w009', category: 'resonance',    title: 'Mmm-Bah',                instruction: 'Go back and forth: long mmmmmm, then pop into bah! Let the hum buzz your lips.' },
  { id: 'w010', category: 'resonance',    title: 'Yawn Sigh',              instruction: 'Open into a big yawn, then sigh down into a long ahhhhh. The yawn opens your throat.' },
  { id: 'w011', category: 'articulation', title: 'Lip Bubbles',            instruction: 'Motorboat! Blow air through your lips in a long bubbly brrrrr. Keep your neck loose.' },
  { id: 'w012', category: 'articulation', title: 'Ba Da Ga',               instruction: 'Repeat ba-da-ga, ba-da-ga slowly, then faster and faster. Feel each consonant pop.' },
  { id: 'w013', category: 'articulation', title: 'Red Lorry',              instruction: 'Say slowly: red lorry, yellow lorry. Speed it up. Red lorry, yellow lorry. Go!' },
  { id: 'w014', category: 'articulation', title: 'Lah Lah Lah',            instruction: 'Flick your tongue rapidly on lah-lah-lah-lah-lah. Keep your jaw still and tongue loose.' },
  { id: 'w015', category: 'pitch',        title: 'Siren',                  instruction: 'Slide your voice from the lowest note you have all the way to the highest. Like a siren.' },
  { id: 'w016', category: 'pitch',        title: 'Five Tones',             instruction: 'Sing mah-may-mee-moh-moo up a five-note scale, then back down. Lift your soft palate.' },
  { id: 'w017', category: 'pitch',        title: 'Octave Jump',            instruction: 'Pick a comfortable note. Jump one octave up. Then back down. Alternate smoothly.' },
  { id: 'w018', category: 'projection',   title: 'Ha Ha Ha',               instruction: 'Say ha from your belly, not your throat. Short, sharp, powerful. Ha! Ha! Ha! Again!' },
  { id: 'w019', category: 'projection',   title: 'Count Across the Room',  instruction: 'Count from one to ten as if calling to someone across a large room. Carry it!' },
  { id: 'w020', category: 'projection',   title: 'Good Morning',           instruction: 'Project a full greeting with resonance and intention. Good moooorning! Own the room!' },
];

export function getWarmupById(id: string): WarmupExercise | undefined {
  return WARMUP_EXERCISES.find(e => e.id === id);
}
