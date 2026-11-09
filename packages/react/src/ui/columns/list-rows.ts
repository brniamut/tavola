import { ACTIONS_COLUMN_ID } from '../../columns/column-sizes.ts';
import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { ViewLayout } from '../../views/saved-view.type.ts';
import type { ColumnListRow } from './column-draft.type.ts';

const REGIONS = ['start', 'center', 'end'] as const;

/**
 * Lowercases and strips accents, so "e" finds "É".
 * @param text Any text.
 * @returns The text to compare.
 */
function fold(text: string): string {
  return text
    .normalize('NFD')
    .replaceAll(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/**
 * The columns the picker lists, in display order: pinned to the start, unpinned, pinned to the
 * end. The actions column is left out. With a search, only columns whose header or group matches.
 * @param layout The draft columns.
 * @param specs The columns by id.
 * @param search What the user typed in the picker's search box.
 * @returns One row per listed column.
 */
export function listRows<TRow>(
  layout: ViewLayout,
  specs: ReadonlyMap<string, ColumnSpec<TRow>>,
  search: string,
): ColumnListRow[] {
  const query = fold(search.trim());
  const pinned = new Set([...layout.pinning.start, ...layout.pinning.end]);
  const ids = {
    start: layout.pinning.start,
    center: layout.order.filter((id) => !pinned.has(id)),
    end: layout.pinning.end,
  };
  const listed = (id: string): boolean => {
    const spec = specs.get(id);
    if (!spec || id === ACTIONS_COLUMN_ID) return false;
    return fold(`${spec.header} ${spec.settings.group ?? ''}`).includes(query);
  };
  return REGIONS.flatMap((region) => {
    const shown = ids[region].filter(listed);
    const movable = shown.filter((id) => specs.get(id)?.settings.reorderable);
    return shown.map((id) => ({ id, region, index: movable.indexOf(id), movable }));
  });
}
