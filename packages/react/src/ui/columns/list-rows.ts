import { ACTIONS_COLUMN_ID } from '../../columns/column-sizes.ts';
import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { ViewLayout } from '../../views/saved-view.type.ts';
import type { ColumnListRow } from './column-draft.type.ts';

const REGIONS = ['start', 'center', 'end'] as const;

/**
 * The shown columns, in display order: pinned to the start, unpinned, pinned to the end. The
 * actions column is left out.
 * @param layout The draft columns.
 * @param specs The columns by id.
 * @returns One row per shown column, with its place among the columns that can move.
 */
export function listRows<TRow>(
  layout: ViewLayout,
  specs: ReadonlyMap<string, ColumnSpec<TRow>>,
): ColumnListRow[] {
  const pinned = new Set([...layout.pinning.start, ...layout.pinning.end]);
  const ids = {
    start: layout.pinning.start,
    center: layout.order.filter((id) => !pinned.has(id)),
    end: layout.pinning.end,
  };
  const shown = (id: string): boolean =>
    specs.has(id) && id !== ACTIONS_COLUMN_ID && layout.visibility[id] !== false;
  return REGIONS.flatMap((region) => {
    const listed = ids[region].filter(shown);
    const movable = listed.filter((id) => specs.get(id)?.settings.reorderable);
    return listed.map((id) => ({ id, region, index: movable.indexOf(id), movable }));
  });
}
