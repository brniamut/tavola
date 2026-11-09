import type { ColumnSpec } from '../columns/column-spec.type.ts';
import type { TableLayout } from '../layout/layout.type.ts';
import { LAYOUT_VERSION, reconcileLayout } from '../layout/reconcile-layout.ts';
import type { ViewLayout } from './saved-view.type.ts';
import { viewLayoutOf } from './view-layout-of.ts';

/**
 * Makes a saved view fit the current columns, like a saved layout: columns that no longer exist
 * are dropped and new ones appear in their default place.
 * @param layout The view's columns, possibly saved for an older set of columns.
 * @param specs The current columns.
 * @param defaults The default layout for these columns.
 * @returns The view's columns, valid for the current columns.
 */
export function fitViewLayout<TRow>(
  layout: ViewLayout,
  specs: readonly ColumnSpec<TRow>[],
  defaults: TableLayout,
): ViewLayout {
  return viewLayoutOf(reconcileLayout({ ...layout, version: LAYOUT_VERSION }, specs, defaults));
}
