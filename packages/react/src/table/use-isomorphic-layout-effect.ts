import { useEffect, useLayoutEffect } from 'react';

/**
 * `useLayoutEffect` in the browser, `useEffect` on the server, so work that must happen before
 * paint (applying a saved layout) does not flash, and server rendering stays quiet.
 */
export const useIsomorphicLayoutEffect: typeof useEffect =
  typeof document === 'undefined' ? useEffect : useLayoutEffect;
