import { DEFAULT_MIN_SIZE_PX, DEFAULT_SIZE_PX } from '../columns/column-sizes.ts';
import type { ColumnKind, ColumnSpec } from '../columns/column-spec.type.ts';
import { isEmptyFilter } from '../filters/is-empty-filter.ts';
import { matchesFilter } from '../filters/matches-filter.ts';
import type { TanStackColumnDef } from './tanstack.type.ts';

/** Id of the selection checkbox column. Starts with `__` so it cannot clash with a row key. */
export const SELECT_COLUMN_ID = '__select';

/** Width of the selection column in pixels. */
export const SELECT_COLUMN_SIZE_PX = 44;

/**
 * The registered sort function for a kind: case-insensitive text for words, plain comparison
 * for numbers, ISO strings, dates and booleans.
 * @param kind The column kind.
 * @returns The key in the feature registry's `sortFns`.
 */
function sortFnFor(kind: ColumnKind): 'text' | 'basic' {
  return kind === 'text' || kind === 'enum' ? 'text' : 'basic';
}

/**
 * Turns one column spec into a TanStack column definition.
 * @param spec The column as `defineColumns` built it.
 * @param read Reads the current spec by id, so accessors and renderers are always the latest
 *   ones even though the definitions themselves stay stable.
 * @returns The definition.
 */
function toColumnDef<TRow>(
  spec: ColumnSpec<TRow>,
  read: (id: string) => ColumnSpec<TRow> | undefined,
): TanStackColumnDef<TRow> {
  const { id, kind, settings } = spec;
  const base: TanStackColumnDef<TRow> = {
    id,
    header: spec.header,
    size: settings.size ?? DEFAULT_SIZE_PX,
    minSize: settings.minSize ?? DEFAULT_MIN_SIZE_PX,
    ...(settings.maxSize !== undefined && { maxSize: settings.maxSize }),
    enableHiding: settings.hideable,
    enableResizing: settings.resizable,
    enableSorting: settings.sortable,
    enableColumnFilter: settings.filterable,
    enableGlobalFilter: settings.searchable,
    meta: { spec: spec as ColumnSpec<unknown> },
  };
  if (kind === 'display') return base;
  return {
    ...base,
    accessorFn: (row) => read(id)?.accessor?.(row),
    sortFn: sortFnFor(kind),
    // Ascending on the first click for every kind; TanStack starts numbers descending.
    sortDescFirst: false,
    sortUndefined: 'last',
    filterFn: Object.assign(
      (row: { getValue: (columnId: string) => unknown }, columnId: string, filter: unknown) =>
        matchesFilter(kind, row.getValue(columnId), filter),
      { autoRemove: isEmptyFilter },
    ),
  };
}

/**
 * Builds the TanStack column definitions for a table, with the selection column first when the
 * table has row selection.
 * @param specs The columns in their default order.
 * @param options Whether rows are selectable, and how to read the latest spec by id.
 * @returns The definitions.
 */
export function toColumnDefs<TRow>(
  specs: readonly ColumnSpec<TRow>[],
  options: { selectable: boolean; read: (id: string) => ColumnSpec<TRow> | undefined },
): TanStackColumnDef<TRow>[] {
  const defs = specs.map((spec) => toColumnDef(spec, options.read));
  if (!options.selectable) return defs;
  const select: TanStackColumnDef<TRow> = {
    id: SELECT_COLUMN_ID,
    header: '',
    size: SELECT_COLUMN_SIZE_PX,
    minSize: SELECT_COLUMN_SIZE_PX,
    maxSize: SELECT_COLUMN_SIZE_PX,
    enableHiding: false,
    enableResizing: false,
    enableSorting: false,
    enableColumnFilter: false,
    enableGlobalFilter: false,
  };
  return [select, ...defs];
}
