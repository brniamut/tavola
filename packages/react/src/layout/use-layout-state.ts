import { useCallback, useMemo, useRef, useState } from 'react';

import { useIsomorphicLayoutEffect } from '../table/use-isomorphic-layout-effect.ts';
import { layoutStorage } from './layout-storage.ts';
import type { TableLayout } from './layout.type.ts';

/**
 * Owns the column layout and remembers it per table id. The saved layout is read after mount,
 * never during render, so server-rendered HTML and the first client render agree. `reconcile`
 * turns whatever was stored into a layout that fits the current columns.
 * @param id The table id, or undefined to not remember the layout.
 * @param defaults The default layout for the current columns.
 * @param reconcile Applies a stored layout to the current columns.
 * @returns The layout, a setter, and a reset that forgets the saved layout.
 */
export function useLayoutState(
  id: string | undefined,
  defaults: TableLayout,
  reconcile: (stored: ReturnType<ReturnType<typeof layoutStorage>['read']>) => TableLayout,
): [TableLayout, (update: (current: TableLayout) => TableLayout) => void, () => void] {
  const [layout, setLayout] = useState(defaults);
  const storage = useMemo(() => (id === undefined ? null : layoutStorage(id)), [id]);
  const loaded = useRef(false);

  useIsomorphicLayoutEffect(() => {
    if (!storage) return;
    loaded.current = true;
    setLayout(reconcile(storage.read()));
    // Read once per table id; later column changes are reconciled by the caller.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [storage]);

  const update = useCallback(
    (updater: (current: TableLayout) => TableLayout) => {
      setLayout((current) => {
        const next = updater(current);
        if (next !== current && storage && loaded.current) storage.write(next);
        return next;
      });
    },
    [storage],
  );

  const reset = useCallback(() => {
    storage?.clear();
    setLayout(defaults);
  }, [storage, defaults]);

  return [layout, update, reset];
}
