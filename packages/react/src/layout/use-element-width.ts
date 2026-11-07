import { useEffect, useState } from 'react';

/**
 * Tracks the inner width of an element with a ResizeObserver. Null until measured, and always
 * null where ResizeObserver does not exist (server rendering, old test environments), so nothing
 * depends on a width that is not known.
 * @returns A callback ref for the element, and its width in pixels or null.
 */
export function useElementWidth(): [(element: HTMLElement | null) => void, number | null] {
  const [element, setElement] = useState<HTMLElement | null>(null);
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setWidth(Math.floor(entry.contentRect.width));
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return [setElement, width];
}
