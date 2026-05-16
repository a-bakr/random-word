import { createAudioPlayer } from './audio';

const player = createAudioPlayer('/twisters');

export const playTwister = (id: string) => player.play(id);
export const stopTwister = () => player.stop();
export const subscribeTwisterPlaying = (fn: (playing: boolean) => void) => player.subscribe(fn);
