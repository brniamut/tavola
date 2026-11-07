import { useEffect, useState } from 'react';

/**
 * Marks the table root while its body is scrolled, for the header shadow (`data-scrolled-y`) and
 * the pinned-column shadows (`data-scrolled-x="start end"`: content hidden under the start or
 * the end pinned columns). Written straight to the DOM, so scrolling never rerenders React.
 * @returns A callback ref for the scroll container.
 */
export function useScrollEdges(): (element: HTMLElement | null) => void {
  const [element, setElement] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const root = element?.closest('.tv-root');
    if (!element || !root) return;
    const update = (): void => {
      const { scrollTop, scrollLeft, scrollWidth, clientWidth } = element;
      const start = Math.abs(scrollLeft) > 0;
      const end = Math.abs(scrollLeft) + clientWidth < scrollWidth - 1;
      root.toggleAttribute('data-scrolled-y', scrollTop > 0);
      const edges = [start && 'start', end && 'end'].filter(Boolean).join(' ');
      if (edges) root.setAttribute('data-scrolled-x', edges);
      else root.removeAttribute('data-scrolled-x');
    };
    update();
    element.addEventListener('scroll', update, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(update);
    observer?.observe(element);
    return () => {
      element.removeEventListener('scroll', update);
      observer?.disconnect();
    };
  }, [element]);
  return setElement;
}
