#!/usr/bin/env node
// Generate WAVs for warm-up exercises using Gemini Flash TTS.
// Usage:
//   GEMINI_API_KEY=... node scripts/generate-warmup-audio.mjs          # all
//   GEMINI_API_KEY=... node scripts/generate-warmup-audio.mjs --force  # overwrite existing

import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/warmup');

const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const VOICE = process.env.GEMINI_TTS_VOICE || 'Kore';
const STYLE = '';
const SAMPLE_RATE = 24000;
const MIN_INTERVAL_MS = Number(process.env.GEMINI_TTS_INTERVAL_MS ?? 22000);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || 'AIzaSyCD2CtLufVovyzeG-pa0u_q01MWO5MO-ps')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

const lastUsedAt = new Map(KEYS.map(k => [k, 0]));

const args = process.argv.slice(2);
const force = args.includes('--force');

const EXERCISES = [
  { id: 'w001', instruction: 'Breathe in for 4 counts. Hold for 4. Out for 4. Hold for 4. Feel your belly expand.' },
  { id: 'w002', instruction: 'Inhale deeply, then exhale slowly on a long ssssss. Make it last 10 seconds.' },
  { id: 'w003', instruction: 'Take a huge inhale, then sigh it all out on ahhhhh. Let everything drop.' },
  { id: 'w004', instruction: 'Blow air through loose relaxed lips to make them flutter. Keep your jaw soft.' },
  { id: 'w005', instruction: 'Slowly roll your head in a wide circle, one direction then the other. Feel the stretch.' },
  { id: 'w006', instruction: 'Place your fingertips on your jaw hinges and make slow circles. Let your mouth hang open.' },
  { id: 'w007', instruction: 'Stick your tongue out as far as it will go. Hold for 3 seconds, then pull it back. Repeat.' },
  { id: 'w008', instruction: 'Hum a low comfortable note. Feel the buzz in your chest. Place a hand there to feel it.' },
  { id: 'w009', instruction: 'Go back and forth: long mmmmmm, then pop into bah! Let the hum buzz your lips.' },
  { id: 'w010', instruction: 'Open into a big yawn, then sigh down into a long ahhhhh. The yawn opens your throat.' },
  { id: 'w011', instruction: 'Motorboat! Blow air through your lips in a long bubbly brrrrr. Keep your neck loose.' },
  { id: 'w012', instruction: 'Repeat ba-da-ga, ba-da-ga slowly, then faster and faster. Feel each consonant pop.' },
  { id: 'w013', instruction: 'Say slowly: red lorry, yellow lorry. Speed it up. Red lorry, yellow lorry. Go!' },
  { id: 'w014', instruction: 'Flick your tongue rapidly on lah-lah-lah-lah-lah. Keep your jaw still and tongue loose.' },
  { id: 'w015', instruction: 'Slide your voice from the lowest note you have all the way to the highest. Like a siren.' },
  { id: 'w016', instruction: 'Sing mah-may-mee-moh-moo up a five-note scale, then back down. Lift your soft palate.' },
  { id: 'w017', instruction: 'Pick a comfortable note. Jump one octave up. Then back down. Alternate smoothly.' },
  { id: 'w018', instruction: 'Say ha from your belly, not your throat. Short, sharp, powerful. Ha! Ha! Ha! Again!' },
  { id: 'w019', instruction: 'Count from one to ten as if calling to someone across a large room. Carry it!' },
  { id: 'w020', instruction: 'Project a full greeting with resonance and intention. Good moooorning! Own the room!' },
];

mkdirSync(OUT_DIR, { recursive: true });

function wrapWav(pcm, sampleRate) {
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
  const blockAlign = (numChannels * bitsPerSample) / 8;
  const dataSize = pcm.length;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(numChannels, 22);
  buf.writeUInt32LE(sampleRate, 24);
  buf.writeUInt32LE(byteRate, 28);
  buf.writeUInt16LE(blockAlign, 32);
  buf.writeUInt16LE(bitsPerSample, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  pcm.copy(buf, 44);
  return buf;
}

async function pickKey() {
  while (true) {
    let bestKey = null;
    let bestWait = Infinity;
    for (const k of KEYS) {
      const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - (lastUsedAt.get(k) || 0)));
      if (wait < bestWait) { bestWait = wait; bestKey = k; }
    }
    if (bestWait === 0) return bestKey;
    await sleep(bestWait);
  }
}

async function callTTS(prompt) {
  for (let attempt = 0; attempt < 12; attempt++) {
    const key = await pickKey();
    lastUsedAt.set(key, Date.now());
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE } } },
        },
      }),
    });
    if (res.ok) return res.json();
    const body = await res.text();
    if (res.status === 429) {
      const m = body.match(/"retryDelay":\s*"(\d+)s"/);
      const parkMs = (m ? Number(m[1]) * 1000 : 30000) + 1000;
      lastUsedAt.set(key, Date.now() + parkMs - MIN_INTERVAL_MS);
      console.log(`  429 — parking ${(parkMs / 1000).toFixed(0)}s (attempt ${attempt + 1})`);
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  throw new Error('Exhausted retries');
}

let generated = 0;
let skipped = 0;

for (const ex of EXERCISES) {
  const out = resolve(OUT_DIR, `${ex.id}.wav`);
  if (existsSync(out) && !force) {
    skipped++;
    console.log(`skip ${ex.id} (exists)`);
    continue;
  }

  const prompt = STYLE ? `${STYLE} ${ex.instruction}` : ex.instruction;
  let json;
  try {
    json = await callTTS(prompt);
  } catch (e) {
    console.error(`fail ${ex.id}: ${e.message}`);
    process.exit(1);
  }

  const part = json?.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
  if (!part) {
    console.error(`fail ${ex.id}: no audio in response`, JSON.stringify(json).slice(0, 500));
    process.exit(1);
  }

  const pcm = Buffer.from(part.inlineData.data, 'base64');
  const wav = wrapWav(pcm, SAMPLE_RATE);
  writeFileSync(out, wav);
  generated++;
  const size = statSync(out).size;
  console.log(`ok   ${ex.id}  ${(size / 1024).toFixed(1)} KB  "${ex.instruction.slice(0, 60)}…"`);
}

console.log(`\ngenerated: ${generated}, skipped: ${skipped}, model: ${MODEL}, voice: ${VOICE}`);
