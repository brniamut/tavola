import { DEFAULT_MIN_SIZE_PX } from '../columns/column-sizes.ts';
import type { ColumnSpec } from '../columns/column-spec.type.ts';
import type { Density, StoredLayout, TableLayout } from './layout.type.ts';

/** The current storage format. Bump it when `StoredLayout` changes incompatibly. */
export const LAYOUT_VERSION = 1;

const DENSITIES: ReadonlySet<string> = new Set<Density>(['compact', 'normal', 'comfortable']);

/**
 * Puts the stored order first, dropping columns that no longer exist, and inserts columns that
 * are new since the layout was saved at their position in the default order.
 * @param stored The saved order.
 * @param defaults The default order.
 * @returns The merged order.
 */
function mergeOrder(stored: readonly string[], defaults: readonly string[]): string[] {
  const known = new Set(defaults);
  const order = stored.filter((id, index) => known.has(id) && stored.indexOf(id) === index);
  defaults.forEach((id, index) => {
    if (order.includes(id)) return;
    const before = defaults.slice(0, index).findLast((previous) => order.includes(previous));
    order.splice(before === undefined ? 0 : order.indexOf(before) + 1, 0, id);
  });
  return order;
}

/**
 * Keeps saved widths only for resizable columns that still exist, clamped to their limits.
 * @param sizing The saved widths.
 * @param specs The current columns by id.
 * @returns The widths that still apply.
 */
function mergeSizing<TRow>(
  sizing: Record<string, number>,
  specs: ReadonlyMap<string, ColumnSpec<TRow>>,
): Record<string, number> {
  const entries = Object.entries(sizing).flatMap(([id, width]) => {
    const settings = specs.get(id)?.settings;
    if (!settings?.resizable || typeof width !== 'number' || !Number.isFinite(width)) return [];
    const min = settings.minSize ?? DEFAULT_MIN_SIZE_PX;
    const max = settings.maxSize ?? Number.POSITIVE_INFINITY;
    return [[id, Math.min(max, Math.max(min, width))] as const];
  });
  return Object.fromEntries(entries);
}

/**
 * The saved density and page size, when they are still valid.
 * @param stored The saved layout.
 * @param defaults The default layout.
 * @returns Density and page size.
 */
function preferences(
  stored: StoredLayout,
  defaults: TableLayout,
): Pick<TableLayout, 'density' | 'pageSize'> {
  const density = DENSITIES.has(stored.density ?? '')
    ? (stored.density as Density)
    : defaults.density;
  const pageSize =
    typeof stored.pageSize === 'number' && stored.pageSize > 0
      ? stored.pageSize
      : defaults.pageSize;
  return { density, pageSize };
}

/**
 * Applies a saved layout to the current columns. A layout saved before columns were added,
 * removed or renamed still loads: unknown ids are dropped, new columns appear in their default
 * place, widths are clamped, and a column that may not be hidden is shown again.
 * @param stored What was read from storage, unchecked.
 * @param specs The current columns.
 * @param defaults The default layout for these columns.
 * @returns A layout that is valid for the current columns.
 */
export function reconcileLayout<TRow>(
  stored: StoredLayout | null,
  specs: readonly ColumnSpec<TRow>[],
  defaults: TableLayout,
): TableLayout {
  if (stored?.version !== LAYOUT_VERSION) return defaults;
  const byId = new Map(specs.map((spec) => [spec.id, spec]));
  const exists = (id: string): boolean => byId.has(id);
  const hideable = Object.entries(stored.visibility ?? {}).filter(
    ([id, visible]) => !visible && byId.get(id)?.settings.hideable,
  );
  const pinning = stored.pinning ?? defaults.pinning;
  return {
    order: mergeOrder(stored.order ?? [], defaults.order),
    visibility: Object.fromEntries(hideable),
    pinning: { start: pinning.start.filter(exists), end: pinning.end.filter(exists) },
    sizing: mergeSizing(stored.sizing ?? {}, byId),
    ...preferences(stored, defaults),
  };
}
