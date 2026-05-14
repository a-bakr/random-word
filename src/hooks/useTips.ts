import { useState, useRef, useCallback } from 'react';
import { vocalTips, frameworkTips, archetypeTips, type Tip } from '../lib/tips';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeShuffleDeck<T>(items: T[]) {
  let deck: T[] = [];
  let index = 0;
  return (): T => {
    if (index >= deck.length) {
      deck = shuffle(items);
      index = 0;
    }
    return deck[index++];
  };
}

export function useTips() {
  const vocalDeck = useRef(makeShuffleDeck(vocalTips));
  const frameworkDeck = useRef(makeShuffleDeck(frameworkTips));
  const archetypeDeck = useRef(makeShuffleDeck(archetypeTips));

  const [activeTips, setActiveTips] = useState<[Tip, Tip, Tip]>(() => [
    vocalDeck.current(),
    frameworkDeck.current(),
    archetypeDeck.current(),
  ]);

  const rotateTips = useCallback(() => {
    setActiveTips([
      vocalDeck.current(),
      frameworkDeck.current(),
      archetypeDeck.current(),
    ]);
  }, []);

  return { activeTips, rotateTips };
}
