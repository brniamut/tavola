import { useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from '../../table/use-isomorphic-layout-effect.ts';

/**
 * Moves focus to an element by its `data-focus-key` after the next render: the first of the given
 * keys whose element exists and is enabled. Used when a click
 * moves or removes the element that had focus: React re-orders and unmounts list items, which
 * would otherwise drop focus on the page body.
 * @returns A ref for the container to search in, and a function that requests focus for keys.
 */
export function useRefocus(): {
  containerRef: { current: HTMLDivElement | null };
  focusLater: (...keys: string[]) => void;
} {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [target, setTarget] = useState<{ keys: string[] } | null>(null);
  useIsomorphicLayoutEffect(() => {
    if (!target) return;
    const candidates =
      containerRef.current?.querySelectorAll<HTMLElement>('[data-focus-key]') ?? [];
    const enabled = [...candidates].filter((element) => !element.matches(':disabled'));
    const match = target.keys
      .map((key) => enabled.find((element) => element.dataset['focusKey'] === key))
      .find(Boolean);
    if (!match) return;
    match.focus();
    // dnd-kit can move a sortable item in the DOM a frame later, which drops focus on the body.
    // Only then focus it again: if the user has moved on to another control, leave focus there.
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      if (active === null || active === document.body) match.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [target]);
  // A new object every time, so the same keys twice still refocus.
  return { containerRef, focusLater: (...keys) => setTarget({ keys }) };
}
