let current: HTMLAudioElement | null = null;

export function playTwister(id: string): void {
  current?.pause();
  current = new Audio(`/twisters/${id}.wav`);
  current.play().catch(() => {});
}

export function stopTwister(): void {
  current?.pause();
  current = null;
}
