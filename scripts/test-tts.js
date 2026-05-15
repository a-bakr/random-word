// Test Gemini TTS: generates audio for twister 001 and saves to public/twisters/test-001.wav
const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'AIzaSyCD2CtLufVovyzeG-pa0u_q01MWO5MO-ps';
const MODEL = 'gemini-2.5-flash-preview-tts';
const TEXT = 'She sells seashells by the seashore. The shells she sells are seashells, I\'m sure.';
const OUT = path.join(__dirname, '../public/twisters/test-001.wav');

const body = JSON.stringify({
  contents: [{ parts: [{ text: TEXT }] }],
  generationConfig: {
    responseModalities: ['AUDIO'],
    speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Aoede' } } },
  },
});

const options = {
  hostname: 'generativelanguage.googleapis.com',
  path: `/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`,
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
};

console.log(`Generating TTS for: "${TEXT.slice(0, 60)}..."`);

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.error) { console.error('API error:', json.error.message); process.exit(1); }
      const audio = json.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (!audio) { console.error('No audio in response:', JSON.stringify(json).slice(0, 300)); process.exit(1); }
      fs.writeFileSync(OUT, Buffer.from(audio, 'base64'));
      const kb = Math.round(fs.statSync(OUT).size / 1024);
      console.log(`✓ Saved ${kb}KB → ${OUT}`);
    } catch (e) {
      console.error('Parse error:', e.message);
      console.error('Raw response:', data.slice(0, 500));
    }
  });
});

req.on('error', e => { console.error('Request error:', e.message); });
req.write(body);
req.end();
