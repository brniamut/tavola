import {
  functionalUpdate,
  type ColumnFiltersState,
  type PaginationState,
} from '@tanstack/react-table';

import { ACTIONS_COLUMN_ID } from '../columns/column-sizes.ts';
import type { FilterValue } from '../filters/filter-value.type.ts';
import { isEmptyFilter } from '../filters/is-empty-filter.ts';
import type { TableQuery } from './table-query.type.ts';
import type { StateHandlers, StateTargets } from './state-handlers.type.ts';
import { SELECT_COLUMN_ID } from './to-column-defs.ts';

/**
 * Removes the selection column id, which Tavola adds itself and never stores.
 * @param ids Column ids.
 * @returns The ids without the selection column.
 */
function withoutSelect(ids: readonly string[]): string[] {
  return ids.filter((id) => id !== SELECT_COLUMN_ID);
}

/**
 * Keeps the row actions column at the very end of the end-pinned columns, where users expect it,
 * when another column is pinned to the end after it.
 * @param ids The end-pinned column ids.
 * @returns The ids with the actions column last.
 */
function actionsLast(ids: readonly string[]): string[] {
  const rest = ids.filter((id) => id !== ACTIONS_COLUMN_ID);
  return rest.length === ids.length ? rest : [...rest, ACTIONS_COLUMN_ID];
}

/**
 * Turns TanStack's filter list into the query's filter record, dropping empty filters.
 * @param filters TanStack's column filters.
 * @returns Filters by column id.
 */
function toFilterRecord(filters: ColumnFiltersState): Record<string, FilterValue> {
  return Object.fromEntries(
    filters
      .filter((filter) => !isEmptyFilter(filter.value))
      .map((filter) => [filter.id, filter.value as FilterValue]),
  );
}

/**
 * The handlers of the slices that make up the query. A change to sort, filters or search goes
 * back to the first page in the same update.
 * @param setQuery Updates the query.
 * @param setLayout Updates the layout, which remembers the page size.
 * @returns The sorting, filter, search and pagination handlers.
 */
function queryHandlers(
  setQuery: StateTargets['setQuery'],
  setLayout: StateTargets['setLayout'],
): Pick<
  StateHandlers,
  'onSortingChange' | 'onColumnFiltersChange' | 'onGlobalFilterChange' | 'onPaginationChange'
> {
  const firstPage = (query: TableQuery): TableQuery['page'] => ({ ...query.page, index: 0 });
  const toPagination = (query: TableQuery): PaginationState => ({
    pageIndex: query.page.index,
    pageSize: query.page.size,
  });
  return {
    onSortingChange: (updater) =>
      setQuery((query) => ({
        ...query,
        sort: functionalUpdate(updater, query.sort),
        page: firstPage(query),
      })),
    onColumnFiltersChange: (updater) =>
      setQuery((query) => {
        const current = Object.entries(query.filters).map(([id, value]) => ({ id, value }));
        return {
          ...query,
          filters: toFilterRecord(functionalUpdate(updater, current)),
          page: firstPage(query),
        };
      }),
    onGlobalFilterChange: (updater) =>
      setQuery((query) => ({
        ...query,
        search: functionalUpdate(updater, query.search),
        page: firstPage(query),
      })),
    onPaginationChange: (updater) =>
      setQuery((query) => {
        const next = functionalUpdate(updater, toPagination(query));
        if (next.pageSize !== query.page.size)
          setLayout((layout) => ({ ...layout, pageSize: next.pageSize }));
        return { ...query, page: { index: next.pageIndex, size: next.pageSize } };
      }),
  };
}

/**
 * The handlers of the slices that make up the layout. The selection column is Tavola's own and
 * is never stored.
 * @param setLayout Updates the layout.
 * @returns The order, visibility, pinning and sizing handlers.
 */
function layoutHandlers(
  setLayout: StateTargets['setLayout'],
): Pick<
  StateHandlers,
  | 'onColumnOrderChange'
  | 'onColumnVisibilityChange'
  | 'onColumnPinningChange'
  | 'onColumnSizingChange'
> {
  return {
    onColumnOrderChange: (updater) =>
      setLayout((layout) => ({
        ...layout,
        order: withoutSelect(functionalUpdate(updater, layout.order)),
      })),
    onColumnVisibilityChange: (updater) =>
      setLayout((layout) => ({
        ...layout,
        visibility: functionalUpdate(updater, layout.visibility),
      })),
    onColumnPinningChange: (updater) =>
      setLayout((layout) => {
        const current = {
          start: [SELECT_COLUMN_ID, ...layout.pinning.start],
          end: layout.pinning.end,
        };
        const next = functionalUpdate(updater, current);
        return {
          ...layout,
          pinning: { start: withoutSelect(next.start), end: actionsLast(withoutSelect(next.end)) },
        };
      }),
    onColumnSizingChange: (updater) =>
      setLayout((layout) => ({ ...layout, sizing: functionalUpdate(updater, layout.sizing) })),
  };
}

/**
 * Creates TanStack's `on*Change` handlers, writing into Tavola's query and layout, so the
 * developer can see and restore all state through one query object and one layout.
 * @param targets The setters of the query, the layout and the selection.
 * @returns The handlers to spread into the `useTable` options.
 */
export function createStateHandlers({
  setQuery,
  setLayout,
  setRowSelection,
}: StateTargets): StateHandlers {
  return {
    ...queryHandlers(setQuery, setLayout),
    ...layoutHandlers(setLayout),
    onRowSelectionChange: setRowSelection,
  };
}
