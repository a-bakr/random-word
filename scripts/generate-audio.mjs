#!/usr/bin/env node
// Generate WAVs for tongue twisters using Gemini Flash TTS.
// Usage:
//   GEMINI_API_KEY=... node scripts/generate-audio.mjs              # all
//   GEMINI_API_KEY=... node scripts/generate-audio.mjs --only 01    # one
//   GEMINI_API_KEY=... node scripts/generate-audio.mjs --force      # overwrite

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/twisters');
const TWISTERS_FILE = resolve(ROOT, 'src/lib/twisters.ts');

const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-3.1-flash-tts-preview';
const VOICE = process.env.GEMINI_TTS_VOICE || 'Kore';
const STYLE = 'Say slowly and clearly, articulating every consonant, for an English-learner practicing pronunciation:';
const SAMPLE_RATE = 24000;
const MIN_INTERVAL_MS = Number(process.env.GEMINI_TTS_INTERVAL_MS ?? 22000); // per-key throttle
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);
const lastUsedAt = new Map(KEYS.map(k => [k, 0]));
let keyCursor = 0;

const args = process.argv.slice(2);
const onlyId = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');

if (!KEYS.length) {
  console.error('GEMINI_API_KEY (or GEMINI_API_KEYS, comma-separated) not set');
  process.exit(1);
}

const src = readFileSync(TWISTERS_FILE, 'utf8');
const twisters = [];
const re = /\{\s*id:\s*'([^']+)',\s*text:\s*'((?:[^'\\]|\\.)*)'/g;
let m;
while ((m = re.exec(src))) {
  twisters.push({ id: m[1], text: m[2].replace(/\\'/g, "'") });
}
if (!twisters.length) {
  console.error('No twisters parsed');
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = onlyId ? twisters.filter(t => t.id === onlyId) : twisters;
if (!targets.length) {
  console.error('No matching twister for --only', onlyId);
  process.exit(1);
}

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

let totalChars = 0;
let generated = 0;
let skipped = 0;

async function pickKey() {
  // Pick the key whose per-key cooldown is smallest; sleep until ready.
  while (true) {
    let bestKey = null;
    let bestWait = Infinity;
    for (const k of KEYS) {
      const wait = Math.max(0, MIN_INTERVAL_MS - (Date.now() - (lastUsedAt.get(k) || 0)));
      if (wait < bestWait) {
        bestWait = wait;
        bestKey = k;
      }
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
      // Park this key for ~retryDelay so the rotator picks a different one.
      const m = body.match(/"retryDelay":\s*"(\d+)s"/);
      const parkMs = (m ? Number(m[1]) * 1000 : 30000) + 1000;
      lastUsedAt.set(key, Date.now() + parkMs - MIN_INTERVAL_MS);
      console.log(`  429 on key …${key.slice(-6)} — parking ${(parkMs / 1000).toFixed(0)}s, trying another (attempt ${attempt + 1})`);
      continue;
    }

    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  throw new Error('Exhausted retries on 429');
}

for (const t of targets) {
  const out = resolve(OUT_DIR, `${t.id}.wav`);
  if (existsSync(out) && !force) {
    skipped++;
    console.log(`skip ${t.id} (exists)`);
    continue;
  }

  const prompt = `${STYLE} ${t.text}`;

  let json;
  try {
    json = await callTTS(prompt);
  } catch (e) {
    console.error(`fail ${t.id}: ${e.message}`);
    process.exit(1);
  }

  const part = json?.candidates?.[0]?.content?.parts?.find(p => p.inlineData?.data);
  if (!part) {
    console.error(`fail ${t.id}: no audio in response`, JSON.stringify(json).slice(0, 500));
    process.exit(1);
  }

  const pcm = Buffer.from(part.inlineData.data, 'base64');
  const wav = wrapWav(pcm, SAMPLE_RATE);
  writeFileSync(out, wav);
  totalChars += t.text.length;
  generated++;
  const size = statSync(out).size;
  console.log(`ok   ${t.id}  ${t.text.length} chars  ${(size / 1024).toFixed(1)} KB  "${t.text.slice(0, 60)}${t.text.length > 60 ? '…' : ''}"`);
}

console.log('');
console.log(`generated: ${generated}, skipped: ${skipped}`);
console.log(`chars:     ${totalChars}`);
console.log(`model:     ${MODEL}, voice: ${VOICE}`);
