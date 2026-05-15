let current: HTMLAudioElement | null = null;
const listeners = new Set<(playing: boolean) => void>();

function notify(playing: boolean): void {
  listeners.forEach(l => l(playing));
}

function detach(audio: HTMLAudioElement | null): void {
  if (!audio) return;
  audio.onended = null;
  audio.onpause = null;
  audio.onplay = null;
}

export function playWarmup(id: string): void {
  detach(current);
  current?.pause();
  const audio = new Audio(`/warmup/${id}.wav`);
  current = audio;
  audio.onplay = () => notify(true);
  audio.onpause = () => { if (current === audio) notify(false); };
  audio.onended = () => { if (current === audio) { current = null; notify(false); } };
  audio.play().catch(() => {
    if (current === audio) { current = null; notify(false); }
  });
}

export function stopWarmup(): void {
  detach(current);
  current?.pause();
  current = null;
  notify(false);
}

export function subscribeWarmupPlaying(fn: (playing: boolean) => void): () => void {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}
