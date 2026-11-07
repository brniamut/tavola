import { useRef } from 'react';

import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect.ts';

/**
 * Keeps a ref to the latest value. Callbacks and renderers the developer passes inline change
 * identity every render; reading them through this ref keeps effects and memoised work from
 * rerunning (or looping) because of that.
 * @param value The value to track.
 * @returns A ref whose `current` is the value of the last commit.
 */
export function useLatest<T>(value: T): { readonly current: T } {
  const ref = useRef(value);
  useIsomorphicLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}
