#!/usr/bin/env node
// Generate WAVs for Arabic warm-up exercises using Gemini Flash TTS.
// Audio reads the instruction followed by the example phrase (when present).
//
// Usage:
//   GEMINI_API_KEY=... node scripts/generate-arabic-warmup-audio.mjs          # all missing
//   GEMINI_API_KEY=... node scripts/generate-arabic-warmup-audio.mjs --force  # overwrite all
//   GEMINI_API_KEY=... node scripts/generate-arabic-warmup-audio.mjs --only ar-w012

import { writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const OUT_DIR = resolve(ROOT, 'public/warmup');

const MODEL = process.env.GEMINI_TTS_MODEL || 'gemini-2.5-flash-preview-tts';
const VOICE = process.env.GEMINI_TTS_VOICE || 'Kore';
const SAMPLE_RATE = 24000;
const MIN_INTERVAL_MS = Number(process.env.GEMINI_TTS_INTERVAL_MS ?? 22000);
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const KEYS = (process.env.GEMINI_API_KEYS || process.env.GEMINI_API_KEY || '')
  .split(',')
  .map(k => k.trim())
  .filter(Boolean);

if (!KEYS.length) {
  console.error('GEMINI_API_KEY (or GEMINI_API_KEYS, comma-separated) not set');
  process.exit(1);
}

const lastUsedAt = new Map(KEYS.map(k => [k, 0]));

const args = process.argv.slice(2);
const onlyId = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const force = args.includes('--force');

// Style prefix — instructs TTS to read the exercise clearly in Arabic
const STYLE = 'اقرأ تعليمات التمرين الصوتي التالي ببطء ووضوح باللغة العربية، وكأنك مدرب صوت محترف:';

const EXERCISES = [
  // breathing
  { id: 'ar-w001', instruction: 'تنفَّس ٤ عدَّات. أمسك ٤. أخرج ٤. أمسك ٤. أحسس بتوسُّع بطنك.',        example: 'واحد... اثنان... ثلاثة... أربعة...' },
  { id: 'ar-w002', instruction: 'خذ نفساً عميقاً، ثم أخرجه ببطء على سسسس طويلة. اجعلها تدوم ١٠ ثوانٍ.', example: 'سسسسسسسسسسسس...' },
  { id: 'ar-w003', instruction: 'خذ نفساً ضخماً، ثم أخرجه على آهههه مريحة. دع كل شيء يهبط.',             example: 'آهههههههه...' },
  { id: 'ar-w004', instruction: 'أخرج الهواء عبر شفتين مرتخيتين لتحدث رفرفة. أبقِ فكَّك ناعماً.',        example: 'بررررررررر...' },
  // physical
  { id: 'ar-w005', instruction: 'دوِّر رأسك ببطء في دائرة واسعة، اتجاهاً ثم الآخر. أحسس بالتمدُّد.' },
  { id: 'ar-w006', instruction: 'ضع أطراف أصابعك على مفصل الفك ودوِّر ببطء. دع فمك ينفتح.' },
  { id: 'ar-w007', instruction: 'أخرج لسانك بأقصى ما يمكن. أمسك ٣ ثوانٍ، ثم اسحبه. كرِّر.' },
  // resonance
  { id: 'ar-w008', instruction: 'أصدر همهمة بنبرة منخفضة مريحة. أحسس الاهتزاز في صدرك. ضع يدك هناك.',   example: 'مممممممممم...' },
  { id: 'ar-w009', instruction: 'تناوب: همهمة طويلة مممممم، ثم انفجر في بَاه! دع الهمهمة تُطنِّن شفتيك.', example: 'مممممممم... بَاه! مممممممم... بَاه!' },
  { id: 'ar-w010', instruction: 'افتح فمك بتثاؤب كبير، ثم تنهَّد نزولاً في آهههه طويلة. التثاؤب يفتح حلقك.', example: 'آهههههههه...' },
  // articulation
  { id: 'ar-w011', instruction: 'أخرج هواء عبر شفتيك في بررررر طويل فقاعي. أبقِ رقبتك مرتخية.',          example: 'بررررررررر...' },
  { id: 'ar-w012', instruction: 'كرِّر بَ-دَ-غَ، بَ-دَ-غَ ببطء، ثم أسرع وأسرع. أحسس كل حرف يتفجَّر.',   example: 'بَ-دَ-غَ، بَ-دَ-غَ، بَ-دَ-غَ!' },
  { id: 'ar-w013', instruction: 'قُل ببطء: كَيَّاك كَايِك. سرِّع. كَيَّاك كَايِك كَيَّاك. هيا!',          example: 'كَيَّاك كَايِك، كَيَّاك كَايِك!' },
  { id: 'ar-w014', instruction: 'حرِّك لسانك بسرعة على لَا-لَا-لَا-لَا. أبقِ فكَّك ثابتاً ولسانك مرتخياً.', example: 'لَا-لَا-لَا-لَا-لَا!' },
  // pitch
  { id: 'ar-w015', instruction: 'أنزلق بصوتك من أدنى نبرة لديك إلى أعلاها. كالصافرة.' },
  { id: 'ar-w016', instruction: 'غنِّ مَا-مِي-مُو-مَا-مُو صعوداً بخمس درجات، ثم نزولاً. ارفع حنكك الناعم.', example: 'مَا-مِي-مُو-مَا-مُو' },
  { id: 'ar-w017', instruction: 'اختر نبرة مريحة. اقفز أوكتاف أعلى. ثم عُد. تناوب بانسيابية.' },
  // projection
  { id: 'ar-w018', instruction: 'قُل هَا من بطنك لا من حلقك. قصيرة، حادة، قوية. هَا! هَا! هَا! مجدداً!', example: 'هَا! هَا! هَا!' },
  { id: 'ar-w019', instruction: 'عُدَّ من واحد إلى عشرة وكأنك تنادي شخصاً في غرفة واسعة. أوصله إليه!',   example: 'وَاحِد! اثْنَان! ثَلَاثَة!' },
  { id: 'ar-w020', instruction: 'قُل تحية الصباح برنين ونية. صَبَاح الخَيْر! امتلك الغرفة! أعِدها!',      example: 'صَبَاح الخَيْر!' },
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
      console.log(`  429 on key …${key.slice(-6)} — parking ${(parkMs / 1000).toFixed(0)}s (attempt ${attempt + 1})`);
      continue;
    }
    throw new Error(`HTTP ${res.status}: ${body}`);
  }
  throw new Error('Exhausted retries on 429');
}

const targets = onlyId ? EXERCISES.filter(e => e.id === onlyId) : EXERCISES;
if (!targets.length) {
  console.error('No matching exercise for --only', onlyId);
  process.exit(1);
}

let generated = 0;
let skipped = 0;

for (const ex of targets) {
  const out = resolve(OUT_DIR, `${ex.id}.wav`);
  if (existsSync(out) && !force) {
    skipped++;
    console.log(`skip ${ex.id} (exists)`);
    continue;
  }

  // Build prompt: style directive + instruction + example (if present)
  const parts = [STYLE, ex.instruction];
  if (ex.example) parts.push(ex.example);
  const prompt = parts.join(' ');

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
  console.log(`ok   ${ex.id}  ${(size / 1024).toFixed(1)} KB  "${ex.instruction.slice(0, 55)}…"`);
}

console.log('');
console.log(`generated: ${generated}, skipped: ${skipped}`);
console.log(`model: ${MODEL}, voice: ${VOICE}`);
