import { useRef, useCallback } from 'react';

export function useLongPress(onLongPress: () => void, delay = 450) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firedRef = useRef(false);

  const start = useCallback((e: React.PointerEvent) => {
    if ((e.target as Element).closest('button, a, input, [role="button"]')) return;
    firedRef.current = false;
    timerRef.current = setTimeout(() => {
      firedRef.current = true;
      onLongPress();
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
