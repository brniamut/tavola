import type { ReactNode } from 'react';

import type { ColumnSpec } from '../columns/column-spec.type.ts';
import type { TableLayout } from '../layout/layout.type.ts';
import type { Locale } from '../locale/locale.type.ts';
import type { BulkAction, Selection, TablePart } from './data-table-props.type.ts';
import type { TableQuery } from './table-query.type.ts';
import type { TanStackTable } from './tanstack.type.ts';

/** Everything the table's parts need, shared through context. Internal. */
export interface TavolaModel<TRow> {
  /** The TanStack table. */
  table: TanStackTable<TRow>;
  /** The latest column specs by id. */
  specs: ReadonlyMap<string, ColumnSpec<TRow>>;
  /** The current query. */
  query: TableQuery;
  /** Updates the query. */
  setQuery: (update: (current: TableQuery) => TableQuery) => void;
  /** The current layout. */
  layout: TableLayout;
  /** Updates the layout. */
  setLayout: (update: (current: TableLayout) => TableLayout) => void;
  /** Restores the default layout and forgets the saved one. */
  resetLayout: () => void;
  /** All texts. */
  locale: Locale;
  /** Formats numbers and dates. */
  formats: { number: Intl.NumberFormat; date: Intl.DateTimeFormat };
  /** Whether rows can be selected. */
  selectable: boolean;
  /** Whether the server sorts, filters and pages. */
  serverMode: boolean;
  /** Rows are loading. */
  loading: boolean;
  /** Why loading failed, or null. */
  error: unknown;
  /** Repeats a failed load; undefined in client mode. */
  retry: (() => void) | undefined;
  /** Rows matching the query across all pages. */
  total: number | null;
  /** Whether there is a next page: from the cursor for cursor APIs, from the total otherwise. */
  canNextPage: boolean;
  /** "Select all matching" is on (server mode). */
  allMatching: boolean;
  /** Turns "select all matching" on or off. */
  setAllMatching: (value: boolean) => void;
  /** Builds the selection object handed to bulk actions. */
  getSelection: () => Selection<TRow>;
  /** The bulk actions. */
  bulkActions: readonly BulkAction<TRow>[];
  /** Page sizes to choose from. */
  pageSizes: readonly number[];
  /** Extra class names per part. */
  classNames: Partial<Record<TablePart, string>>;
  /** Row click handler. */
  onRowClick: ((row: TRow) => void) | undefined;
  /** Content at the end of the toolbar. */
  toolbar: ReactNode;
  /** Replacement for the empty text. */
  empty: ReactNode;
  /** Callback ref for the scroll container, measured to hide low-priority columns that do not fit. */
  measureScroller: (element: HTMLElement | null) => void;
  /** The table's accessible name. */
  label: string | undefined;
}
