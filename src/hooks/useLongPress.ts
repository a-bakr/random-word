import { useRef, useCallback } from 'react';

export function useLongPress(onLongPress: (x: number, y: number) => void, delay = 450) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const firedRef = useRef(false);

  const start = useCallback((e: React.PointerEvent) => {
    if ((e.target as Element).closest('button, a, input, [role="button"]')) return;
    posRef.current = { x: e.clientX, y: e.clientY };
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress(posRef.current.x, posRef.current.y);
    }, delay);
  }, [onLongPress, delay]);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return { start, cancel, firedRef };
}
