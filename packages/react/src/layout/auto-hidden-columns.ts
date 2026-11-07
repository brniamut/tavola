import { DEFAULT_SIZE_PX } from '../columns/column-sizes.ts';
import type { ColumnSpec } from '../columns/column-spec.type.ts';
import type { TableLayout } from './layout.type.ts';

/**
 * The columns to hide because the table is narrower than its columns: those with a `priority`,
 * highest number first, until the rest fits. A column the user chose to show (visibility `true`
 * in the layout) or to hide is left to the user. Widths come from the layout and the column
 * settings, not from the DOM, so the result cannot oscillate as columns appear and disappear.
 * @param specs The columns.
 * @param layout The layout, for widths and the user's own visibility choices.
 * @param space The width available and the width taken by columns Tavola adds (selection).
 * @returns The ids to hide.
 */
export function autoHiddenColumns<TRow>(
  specs: readonly ColumnSpec<TRow>[],
  layout: TableLayout,
  space: { width: number | null; extra: number },
): ReadonlySet<string> {
  const hidden = new Set<string>();
  if (space.width === null) return hidden;
  const shown = specs.filter((spec) => layout.visibility[spec.id] !== false);
  const widthOf = (spec: ColumnSpec<TRow>): number =>
    layout.sizing[spec.id] ?? spec.settings.size ?? DEFAULT_SIZE_PX;
  let total = space.extra + shown.reduce((sum, spec) => sum + widthOf(spec), 0);
  const candidates = shown
    .filter((spec) => spec.settings.priority !== undefined && layout.visibility[spec.id] !== true)
    .toSorted((left, right) => (right.settings.priority ?? 0) - (left.settings.priority ?? 0));
  for (const spec of candidates) {
    if (total <= space.width) break;
    hidden.add(spec.id);
    total -= widthOf(spec);
  }
  return hidden;
}
