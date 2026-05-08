#!/usr/bin/env node
// Generate MP3s for tongue twisters using OpenAI TTS.
// Usage:
//   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs              # all
//   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs --only 01    # one
//   OPENAI_API_KEY=sk-... node scripts/generate-audio.mjs --force      # overwrite

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/twisters');
const TWISTERS_FILE = resolve(ROOT, 'src/lib/twisters.ts');

const MODEL = 'tts-1-hd';
const VOICE = 'nova';
const PRICE_PER_1M = 30;

const args = process.argv.slice(2);
const onlyId = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');

if (!process.env.OPENAI_API_KEY) {
  console.error('OPENAI_API_KEY not set');
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
  console.error('No twisters parsed from', TWISTERS_FILE);
  process.exit(1);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = onlyId ? twisters.filter(t => t.id === onlyId) : twisters;
if (!targets.length) {
  console.error('No matching twister for --only', onlyId);
  process.exit(1);
}

let totalChars = 0;
let generated = 0;
let skipped = 0;

for (const t of targets) {
  const out = resolve(OUT_DIR, `${t.id}.mp3`);
  if (existsSync(out) && !force) {
    skipped++;
    console.log(`skip ${t.id} (exists)`);
    continue;
  }

  const res = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      voice: VOICE,
      input: t.text,
      response_format: 'mp3',
      speed: 0.95,
    }),
  });

  if (!res.ok) {
    console.error(`fail ${t.id}: ${res.status} ${await res.text()}`);
    process.exit(1);
  }

  const buf = Buffer.from(await res.arrayBuffer());
  writeFileSync(out, buf);
  totalChars += t.text.length;
  generated++;
  const size = statSync(out).size;
  console.log(`ok   ${t.id}  ${t.text.length} chars  ${(size / 1024).toFixed(1)} KB  "${t.text.slice(0, 60)}${t.text.length > 60 ? '…' : ''}"`);
}

const cost = (totalChars / 1_000_000) * PRICE_PER_1M;
console.log('');
console.log(`generated: ${generated}, skipped: ${skipped}`);
console.log(`chars:     ${totalChars}`);
console.log(`model:     ${MODEL} ($${PRICE_PER_1M}/1M chars)`);
console.log(`cost:      $${cost.toFixed(4)}`);
