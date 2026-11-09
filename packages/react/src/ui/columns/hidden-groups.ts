import { ACTIONS_COLUMN_ID } from '../../columns/column-sizes.ts';
import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { ViewLayout } from '../../views/saved-view.type.ts';

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
 * The hidden columns that match the search, grouped by their `group` in the order the groups
 * first appear among the columns. Columns without a group come last, under an empty name.
 * @param layout The draft columns.
 * @param specs The columns by id, in their defined order.
 * @param search What the user typed; matches the header or the group.
 * @returns The groups with their column ids.
 */
export function hiddenGroups<TRow>(
  layout: ViewLayout,
  specs: ReadonlyMap<string, ColumnSpec<TRow>>,
  search: string,
): { group: string; ids: string[] }[] {
  const query = fold(search.trim());
  const groups = new Map<string, string[]>();
  for (const spec of specs.values()) {
    const group = spec.settings.group ?? '';
    const hidden = layout.visibility[spec.id] === false && spec.id !== ACTIONS_COLUMN_ID;
    if (!hidden || !fold(`${spec.header} ${group}`).includes(query)) continue;
    groups.set(group, [...(groups.get(group) ?? []), spec.id]);
  }
  const named = [...groups].filter(([group]) => group !== '');
  const loose = groups.get('');
  const entries = loose ? [...named, ['', loose] as const] : named;
  return entries.map(([group, ids]) => ({ group, ids: [...ids] }));
}
