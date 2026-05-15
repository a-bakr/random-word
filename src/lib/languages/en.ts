import { generate } from 'random-words';
import { registerLanguage } from './registry';

registerLanguage({
  code: 'en',
  name: 'English',
  nativeName: 'English',
  direction: 'ltr',
  speechRecognitionCode: 'en-US',
  labels: {
    words: 'Words',
    twisters: 'Twisters',
    warmup: 'Warm-up',
    tapMe: 'tap me',
  },
  generateWord: () => generate() as string,
});
