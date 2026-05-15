'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { vocalTips, frameworkTips, archetypeTips, type Tip } from '../lib/tips';
import { useLanguage } from '../contexts/LanguageContext';

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

export function useTips(tipCount: number) {
  const { lang } = useLanguage();

  const vocalDeck   = useRef(makeShuffleDeck(lang.tips?.vocal     ?? vocalTips));
  const frameworkDeck = useRef(makeShuffleDeck(lang.tips?.framework ?? frameworkTips));
  const archetypeDeck = useRef(makeShuffleDeck(lang.tips?.archetype ?? archetypeTips));
  const categoryOffsetRef = useRef(0);

  const decksRef = useRef([
    () => vocalDeck.current(),
    () => frameworkDeck.current(),
    () => archetypeDeck.current(),
  ]);

  const draw = useCallback((count: number, offset: number): Tip[] =>
    Array.from({ length: count }, (_, i) => decksRef.current[(offset + i) % 3]()),
  []);

  const [activeTips, setActiveTips] = useState<Tip[]>(() => draw(tipCount, 0));

  // Rebuild shuffle decks when the language changes
  useEffect(() => {
    vocalDeck.current     = makeShuffleDeck(lang.tips?.vocal     ?? vocalTips);
    frameworkDeck.current = makeShuffleDeck(lang.tips?.framework ?? frameworkTips);
    archetypeDeck.current = makeShuffleDeck(lang.tips?.archetype ?? archetypeTips);
    categoryOffsetRef.current = 0;
    setActiveTips(draw(tipCount, 0));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang.code]);

  const rotateTips = useCallback(() => {
    const next = (categoryOffsetRef.current + tipCount) % 3;
    categoryOffsetRef.current = next;
    setActiveTips(draw(tipCount, next));
  }, [tipCount, draw]);

  useEffect(() => {
    setActiveTips(draw(tipCount, categoryOffsetRef.current));
  }, [tipCount, draw]);

  return { activeTips, rotateTips };
}
