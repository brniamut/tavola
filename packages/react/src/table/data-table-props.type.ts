import type { ReactNode } from 'react';

import type { ColumnSpec } from '../columns/column-spec.type.ts';
import type { Density } from '../layout/layout.type.ts';
import type { Locale } from '../locale/locale.type.ts';
import type { Fetcher, TableQuery } from './table-query.type.ts';
import type { TanStackTable } from './tanstack.type.ts';

/** The rows a bulk action applies to. */
export interface Selection<TRow> {
  /** Ids of the selected rows, also those on other pages. */
  ids: string[];
  /** The selected rows that are loaded. In server mode, rows on other pages are not. */
  rows: TRow[];
  /**
   * True when the user chose "select all" across pages in server mode. Then `ids` lists only the
   * loaded rows; apply the action to every row matching `query` on the server.
   */
  allMatching: boolean;
  /** The query at the time of the action: the filters that define "all matching". */
  query: TableQuery;
  /** Clears the selection, for example after a delete. */
  clear: () => void;
}

/** A button in the bar that appears when rows are selected. */
export interface BulkAction<TRow> {
  /** Button text. */
  label: string;
  /** Runs with the selection. While a returned promise is pending, the bar is disabled. */
  onAction: (selection: Selection<TRow>) => void | Promise<void>;
  /** Shown in a warning colour. */
  danger?: boolean | undefined;
}

/** The parts of the table you can add class names to. */
export type TablePart =
  | 'root'
  | 'toolbar'
  | 'scroller'
  | 'table'
  | 'headerRow'
  | 'headerCell'
  | 'row'
  | 'cell'
  | 'footer';

/**
 * A built-in look. `cotto` (the default) is warm paper with a terracotta accent; `ink` is
 * monochrome; `basil` is green; `harbor` is slate and blue; `ledger` is an account book with
 * stripes and ruled columns.
 */
export type TableTheme = 'cotto' | 'ink' | 'basil' | 'harbor' | 'ledger';

/** Props of `<DataTable>`. Only `columns`, `getRowId` and one of `data` or `fetcher` are needed. */
export interface DataTableProps<TRow> {
  /** The columns, from `defineColumns`. */
  columns: ColumnSpec<TRow>[];
  /**
   * A stable, unique id per row, such as a database id. Selection uses it, so it survives
   * sorting, filtering and page changes. Never use the array index.
   */
  getRowId: (row: TRow) => string;
  /** All rows, for client mode: the table sorts, filters and pages them itself. */
  data?: TRow[] | undefined;
  /**
   * Fetches a page of rows, for server mode: the table sends the query and shows what comes back.
   * Takes precedence over `data`.
   */
  fetcher?: Fetcher<TRow> | undefined;
  /** Remembers the column layout in localStorage under this id. Unique per table in your app. */
  id?: string | undefined;
  /** Accessible name of the table. */
  label?: string | undefined;
  /** Actions on selected rows. Giving any turns on row selection. */
  bulkActions?: BulkAction<TRow>[] | undefined;
  /** Turns on row selection without bulk actions; read it with `onSelectionChange`. */
  selectable?: boolean | undefined;
  /** Reports the selection whenever it changes. */
  onSelectionChange?: ((selection: Selection<TRow>) => void) | undefined;
  /** Controls the query. Pass it together with `onQueryChange`. */
  query?: TableQuery | undefined;
  /** Reports every query change: sort, filters, search and page. */
  onQueryChange?: ((query: TableQuery) => void) | undefined;
  /** The query to start with, when the query is not controlled. */
  defaultQuery?: Partial<TableQuery> | undefined;
  /** Page sizes to choose from. The first is the default. */
  pageSizes?: number[] | undefined;
  /** Row density to start with. */
  defaultDensity?: Density | undefined;
  /** Called when a row is clicked, outside checkboxes, menus and links. */
  onRowClick?: ((row: TRow) => void) | undefined;
  /** Client mode: show the loading state, while you fetch all rows. */
  loading?: boolean | undefined;
  /** Client mode: show the error state with this error. */
  error?: unknown;
  /** Translations or other wording for some or all texts. */
  locale?: Partial<Locale> | undefined;
  /** A built-in look. Fine-tune any theme with the --tv-* CSS variables. Default `cotto`. */
  theme?: TableTheme | undefined;
  /** Extra class names per part of the table. */
  classNames?: Partial<Record<TablePart, string>> | undefined;
  /** Rendered at the end of the toolbar, such as an "Add user" button. */
  toolbar?: ReactNode;
  /** Replaces the text shown when there are no rows at all. */
  empty?: ReactNode;
  /** Receives the TanStack table instance: the escape hatch for anything this API lacks. */
  tableRef?: { current: TanStackTable<TRow> | null } | undefined;
}
