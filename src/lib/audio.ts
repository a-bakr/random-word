export interface AudioPlayer {
  play(id: string): void;
  stop(): void;
  subscribe(fn: (playing: boolean) => void): () => void;
}

export function createAudioPlayer(basePath: string): AudioPlayer {
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

  return {
    play(id: string): void {
      detach(current);
      current?.pause();
      const audio = new Audio(`${basePath}/${id}.wav`);
      current = audio;
      audio.onplay = () => notify(true);
      audio.onpause = () => { if (current === audio) notify(false); };
      audio.onended = () => { if (current === audio) { current = null; notify(false); } };
      audio.play().catch(() => {
        if (current === audio) { current = null; notify(false); }
      });
    },
    stop(): void {
      detach(current);
      current?.pause();
      current = null;
      notify(false);
    },
    subscribe(fn: (playing: boolean) => void): () => void {
      listeners.add(fn);
      return () => { listeners.delete(fn); };
    },
  };
}
