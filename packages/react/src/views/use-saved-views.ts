import { useCallback, useMemo, useState } from 'react';

import { useIsomorphicLayoutEffect } from '../table/use-isomorphic-layout-effect.ts';
import { useLatest } from '../table/use-latest.ts';
import type { SavedView } from './saved-view.type.ts';
import { viewStorage } from './view-storage.ts';

/** No saved views. */
const NO_VIEWS: SavedView[] = [];

/**
 * The saved views of a table. Controlled with `views` and `onViewsChange`, for example to store
 * them on your server; otherwise kept in localStorage under the table id. Without either, the
 * user cannot save views.
 * @param id The table id, or undefined.
 * @param controlled The `views` and `onViewsChange` props.
 * @returns The views, and a setter that is null when views cannot be saved.
 */
export function useSavedViews(
  id: string | undefined,
  controlled: {
    views: readonly SavedView[] | undefined;
    onViewsChange: ((views: SavedView[]) => void) | undefined;
  },
): { views: readonly SavedView[]; setViews: ((views: SavedView[]) => void) | null } {
  const storage = useMemo(() => (id === undefined ? null : viewStorage(id)), [id]);
  const [stored, setStored] = useState<SavedView[]>(NO_VIEWS);
  const report = useLatest(controlled.onViewsChange);
  const isControlled = controlled.views !== undefined;

  useIsomorphicLayoutEffect(() => {
    // Read after mount, so server-rendered HTML and the first client render agree.
    if (storage && !isControlled) setStored(storage.read());
  }, [storage, isControlled]);

  const setViews = useCallback(
    (views: SavedView[]) => {
      if (!isControlled) {
        setStored(views);
        storage?.write(views);
      }
      report.current?.(views);
    },
    [isControlled, storage, report],
  );
  const canSave = isControlled || storage !== null || controlled.onViewsChange !== undefined;
  return { views: controlled.views ?? stored, setViews: canSave ? setViews : null };
}
