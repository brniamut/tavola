import type { RowSelectionState, TableState } from '@tanstack/react-table';

import type { TableLayout } from '../layout/layout.type.ts';
import type { TableQuery } from './table-query.type.ts';
import type { Features } from './tanstack.type.ts';
import { SELECT_COLUMN_ID } from './to-column-defs.ts';

/**
 * Maps Tavola's query, layout and selection onto TanStack's state slices. Tavola owns all
 * of them, so TanStack never holds state the developer cannot see or restore.
 * @param query The current query.
 * @param layout The current layout.
 * @param selection Selected row ids, whether the selection column is shown, and the columns
 *   hidden because they do not fit.
 * @returns The `state` option for `useTable`.
 */
export function toTanStackState(
  query: TableQuery,
  layout: TableLayout,
  selection: { rows: RowSelectionState; selectable: boolean; autoHidden: ReadonlySet<string> },
): Partial<TableState<Features>> {
  const select = selection.selectable ? [SELECT_COLUMN_ID] : [];
  return {
    sorting: query.sort,
    columnFilters: Object.entries(query.filters).map(([id, value]) => ({ id, value })),
    globalFilter: query.search,
    pagination: { pageIndex: query.page.index, pageSize: query.page.size },
    columnOrder: [...select, ...layout.order],
    // Columns hidden for lack of space come first, so the user's own choices override them.
    columnVisibility: {
      ...Object.fromEntries([...selection.autoHidden].map((id) => [id, false])),
      ...layout.visibility,
    },
    columnPinning: { start: [...select, ...layout.pinning.start], end: layout.pinning.end },
    columnSizing: layout.sizing,
    rowSelection: selection.rows,
  };
}
