import { createAudioPlayer } from './audio';

const player = createAudioPlayer('/warmup');

export const playWarmup = (id: string) => player.play(id);
export const stopWarmup = () => player.stop();
export const subscribeWarmupPlaying = (fn: (playing: boolean) => void) => player.subscribe(fn);
