import type { ColumnSpec } from '../columns/column-spec.type.ts';
import type { ViewLayout } from './saved-view.type.ts';

/**
 * Shows the columns of a preset, in the preset's order, and hides the rest. Columns that may not
 * be hidden stay visible. Pins and widths are kept.
 * @param layout The columns before the preset.
 * @param columns The preset's column ids.
 * @param specs The current columns by id.
 * @returns The columns with the preset applied.
 */
export function applyPreset<TRow>(
  layout: ViewLayout,
  columns: readonly string[],
  specs: ReadonlyMap<string, ColumnSpec<TRow>>,
): ViewLayout {
  const listed = columns.filter((id, index) => specs.has(id) && columns.indexOf(id) === index);
  const chosen = new Set(listed);
  const rest = layout.order.filter((id) => !chosen.has(id));
  const hidden = rest.filter((id) => specs.get(id)?.settings.hideable);
  return {
    ...layout,
    order: [...listed, ...rest],
    visibility: Object.fromEntries(hidden.map((id) => [id, false])),
  };
}
