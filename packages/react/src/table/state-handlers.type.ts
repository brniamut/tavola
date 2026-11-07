import type {
  ColumnFiltersState,
  ColumnPinningState,
  OnChangeFn,
  PaginationState,
  RowSelectionState,
  SortingState,
} from '@tanstack/react-table';

import type { TableLayout } from '../layout/layout.type.ts';
import type { TableQuery } from './table-query.type.ts';

/** Where the TanStack state handlers write. */
export interface StateTargets {
  /** Updates the query. */
  setQuery: (update: (current: TableQuery) => TableQuery) => void;
  /** Updates the layout. */
  setLayout: (update: (current: TableLayout) => TableLayout) => void;
  /** Updates the selected row ids. */
  setRowSelection: OnChangeFn<RowSelectionState>;
}

/** The `on*Change` options Tavola passes to `useTable`. */
export interface StateHandlers {
  onSortingChange: OnChangeFn<SortingState>;
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>;
  onGlobalFilterChange: OnChangeFn<string>;
  onPaginationChange: OnChangeFn<PaginationState>;
  onColumnOrderChange: OnChangeFn<string[]>;
  onColumnVisibilityChange: OnChangeFn<Record<string, boolean>>;
  onColumnPinningChange: OnChangeFn<ColumnPinningState>;
  onColumnSizingChange: OnChangeFn<Record<string, number>>;
  onRowSelectionChange: OnChangeFn<RowSelectionState>;
}
