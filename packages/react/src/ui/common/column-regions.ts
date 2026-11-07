import type { TanStackColumn, TanStackTable } from '../../table/tanstack.type.ts';

/**
 * The visible columns of a table in their three regions. The table renders start, center, a
 * filler that takes up spare width, then end, so end-pinned columns sit at the right edge.
 * @param table The TanStack table.
 * @returns The visible columns per region, and their ids as one key that changes when the
 *   columns or their order change.
 */
export function columnRegions<TRow>(table: TanStackTable<TRow>): {
  start: TanStackColumn<TRow>[];
  center: TanStackColumn<TRow>[];
  end: TanStackColumn<TRow>[];
  key: string;
} {
  const start = table.getStartVisibleLeafColumns();
  const center = table.getCenterVisibleLeafColumns();
  const end = table.getEndVisibleLeafColumns();
  const key = [start, center, end]
    .map((region) => region.map((column) => column.id).join(','))
    .join('|');
  return { start, center, end, key };
}
