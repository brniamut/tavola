import { useCallback, useRef, useState } from 'react';

import type { TableQuery } from './table-query.type.ts';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect.ts';
import { useLatest } from './use-latest.ts';

/**
 * Owns the table query. Uncontrolled by default; pass `query` and `onQueryChange` together to
 * control it (to sync it with the URL, for example). Passing only `onQueryChange` keeps the query
 * internal and reports changes, so the table never freezes the way TanStack does when a change
 * handler comes without its state.
 * @param options The controlled query and change handler, if any, and the initial query.
 * @returns The current query and a function to update it.
 */
export function useQueryState(options: {
  query: TableQuery | undefined;
  onQueryChange: ((query: TableQuery) => void) | undefined;
  initial: TableQuery;
}): [TableQuery, (update: (current: TableQuery) => TableQuery) => void] {
  const [internal, setInternal] = useState(options.initial);
  const controlled = options.query !== undefined;
  const query = options.query ?? internal;
  const latest = useLatest({ onQueryChange: options.onQueryChange, controlled });
  // Updated on every change, not only on commit, so two updates in one event (sort, then reset
  // the page) both apply instead of the second overwriting the first.
  const current = useRef(query);
  useIsomorphicLayoutEffect(() => {
    current.current = query;
  }, [query]);

  const update = useCallback(
    (updater: (current: TableQuery) => TableQuery) => {
      const { onQueryChange, controlled: isControlled } = latest.current;
      const next = updater(current.current);
      if (next === current.current) return;
      current.current = next;
      if (!isControlled) setInternal(next);
      onQueryChange?.(next);
    },
    [latest],
  );
  return [query, update];
}
