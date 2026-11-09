import { useTable } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo } from 'react';

import { defaultLayout } from '../layout/default-layout.ts';
import { reconcileLayout } from '../layout/reconcile-layout.ts';
import { autoHiddenColumns } from '../layout/auto-hidden-columns.ts';
import { useElementWidth } from '../layout/use-element-width.ts';
import { useLayoutState } from '../layout/use-layout-state.ts';
import { defaultLocale } from '../locale/default-locale.ts';
import { useServerRows } from '../server/use-server-rows.ts';
import type { TavolaModel } from './tavola-model.type.ts';
import { createStateHandlers } from './create-state-handlers.ts';
import type { DataTableProps } from './data-table-props.type.ts';
import { features } from './features.ts';
import type { TableQuery } from './table-query.type.ts';
import type { TanStackTable } from './tanstack.type.ts';
import { SELECT_COLUMN_SIZE_PX } from './to-column-defs.ts';
import { toTanStackState } from './to-tanstack-state.ts';
import { useColumnDefs } from './use-column-defs.ts';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect.ts';
import { useLatest } from './use-latest.ts';
import { useQueryState } from './use-query-state.ts';
import { useSelection } from './use-selection.ts';
import { useSavedViews } from '../views/use-saved-views.ts';

/** Rows per page when the developer gives no page sizes. */
const DEFAULT_PAGE_SIZE = 25;

/** Page sizes when the developer gives none. */
const DEFAULT_PAGE_SIZES = [DEFAULT_PAGE_SIZE, DEFAULT_PAGE_SIZE * 2, 100] as const;

/** One empty array for every client table without data, so the row model stays stable. */
const NO_ROWS: never[] = [];

/** No bulk actions. */
const NO_ACTIONS: never[] = [];

/** No column presets. */
const NO_PRESETS: never[] = [];

/**
 * The query a table starts with.
 * @param partial What the developer passed as `defaultQuery`.
 * @param pageSize The default page size.
 * @returns A complete query.
 */
function initialQuery(partial: Partial<TableQuery> | undefined, pageSize: number): TableQuery {
  return {
    sort: partial?.sort ?? [],
    filters: partial?.filters ?? {},
    search: partial?.search ?? '',
    page: partial?.page ?? { index: 0, size: pageSize },
  };
}

/**
 * The layout, remembered per table id, and the query, whose page size follows the saved layout.
 * @param props The `<DataTable>` props.
 * @param pageSizes The page sizes to choose from; the first is the default.
 * @returns The layout and query with their setters.
 */
function useQueryAndLayout<TRow>(
  props: DataTableProps<TRow>,
  pageSizes: readonly number[],
): {
  layout: TavolaModel<TRow>['layout'];
  setLayout: TavolaModel<TRow>['setLayout'];
  resetLayout: () => void;
  defaults: TavolaModel<TRow>['defaults'];
  query: TableQuery;
  setQuery: TavolaModel<TRow>['setQuery'];
} {
  const defaults = useMemo(
    () =>
      defaultLayout(props.columns, {
        density: props.defaultDensity ?? 'normal',
        pageSize: pageSizes[0] ?? DEFAULT_PAGE_SIZE,
      }),
    [props.columns, props.defaultDensity, pageSizes],
  );
  const [layout, setLayout, resetLayout] = useLayoutState(props.id, defaults, (stored) =>
    reconcileLayout(stored, props.columns, defaults),
  );
  const [query, setQuery] = useQueryState({
    query: props.query,
    onQueryChange: props.onQueryChange,
    initial: initialQuery(props.defaultQuery, layout.pageSize),
  });
  useIsomorphicLayoutEffect(() => {
    if (layout.pageSize !== query.page.size)
      setQuery((current) => ({ ...current, page: { index: 0, size: layout.pageSize } }));
    // Follow the saved page size when the layout loads; the query owns it afterwards.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [layout.pageSize]);
  return { layout, setLayout, resetLayout, defaults, query, setQuery };
}

/**
 * TanStack's state, with columns that do not fit hidden by their priority. The table's scroll
 * container is measured for that.
 * @param columns The column specs.
 * @param parts The query, layout, selection and whether rows are selectable.
 * @returns The state for `useTable`, and the ref to put on the scroll container.
 */
function useStateWithAutoHiding<TRow>(
  columns: DataTableProps<TRow>['columns'],
  parts: {
    query: TableQuery;
    layout: TavolaModel<TRow>['layout'];
    selection: ReturnType<typeof useSelection<TRow>>;
    selectable: boolean;
  },
): {
  state: ReturnType<typeof toTanStackState>;
  measureScroller: TavolaModel<TRow>['measureScroller'];
} {
  const { query, layout, selection, selectable } = parts;
  const [measureScroller, width] = useElementWidth();
  const autoHidden = useMemo(
    () =>
      autoHiddenColumns(columns, layout, { width, extra: selectable ? SELECT_COLUMN_SIZE_PX : 0 }),
    [columns, layout, width, selectable],
  );
  const state = useMemo(
    () => toTanStackState(query, layout, { rows: selection.rows, selectable, autoHidden }),
    [query, layout, selection.rows, selectable, autoHidden],
  );
  return { state, measureScroller };
}

/**
 * Builds the TanStack table and the state around it from `<DataTable>` props.
 * @param props The props of `<DataTable>`.
 * @returns The model the table's parts render from.
 */
export function useTavola<TRow>(props: DataTableProps<TRow>): TavolaModel<TRow> {
  const bulkActions = props.bulkActions ?? NO_ACTIONS;
  const selectable = props.selectable === true || bulkActions.length > 0;
  const pageSizes = props.pageSizes ?? DEFAULT_PAGE_SIZES;
  const serverMode = props.fetcher !== undefined;
  const { defs, byId } = useColumnDefs(props.columns, selectable);
  const queryAndLayout = useQueryAndLayout(props, pageSizes);
  const { layout, setLayout, query, setQuery } = queryAndLayout;

  const server = useServerRows(props.fetcher, query, () =>
    setQuery((current) => ({ ...current, page: { ...current.page, index: 0 } })),
  );
  const selection = useSelection<TRow>(query);
  const getRowId = useLatest(props.getRowId);
  const { state, measureScroller } = useStateWithAutoHiding(props.columns, {
    query,
    layout,
    selection,
    selectable,
  });
  const handlers = useMemo(
    () => createStateHandlers({ setQuery, setLayout, setRowSelection: selection.setRows }),
    [setQuery, setLayout, selection.setRows],
  );
  const table = useTable({
    features,
    columns: defs,
    data: (serverMode ? server.rows : (props.data ?? NO_ROWS)) as (TRow & object)[],
    getRowId: useCallback((row: TRow & object) => getRowId.current(row), [getRowId]),
    state,
    ...handlers,
    manualSorting: serverMode,
    manualFiltering: serverMode,
    manualPagination: serverMode,
    // A cursor API without a total: the page count is unknown (-1); `hasNext` decides instead.
    ...(serverMode && (server.total === null ? { pageCount: -1 } : { rowCount: server.total })),
    autoResetPageIndex: false,
    enableMultiSort: true,
    isMultiSortEvent: (event) => (event as { shiftKey?: boolean }).shiftKey === true,
    enableRowSelection: selectable,
    columnResizeMode: 'onChange',
  }) as TanStackTable<TRow>;

  useReporting(props, table, selection);
  return useModel(props, {
    ...queryAndLayout,
    table,
    byId,
    server,
    selection,
    selectable,
    serverMode,
    bulkActions,
    pageSizes,
    measureScroller,
  });
}

/**
 * Hands the table to `tableRef` and reports selection changes.
 * @param props The `<DataTable>` props.
 * @param table The TanStack table.
 * @param selection The selection state.
 */
function useReporting<TRow>(
  props: DataTableProps<TRow>,
  table: TanStackTable<TRow>,
  selection: ReturnType<typeof useSelection<TRow>>,
): void {
  const { tableRef } = props;
  useIsomorphicLayoutEffect(() => {
    if (!tableRef) return;
    tableRef.current = table;
    return () => {
      tableRef.current = null;
    };
  }, [tableRef, table]);

  const report = useLatest(props.onSelectionChange);
  const build = useLatest(selection.build);
  useEffect(() => {
    report.current?.(build.current(table));
    // Report when the selection changes, not on every render.
    // oxlint-disable-next-line react/exhaustive-deps
  }, [selection.rows, selection.allMatching]);
}

/**
 * Assembles the model the table's parts read from context.
 * @param props The `<DataTable>` props.
 * @param parts The state built by `useTavola`.
 * @returns The model.
 */
function useModel<TRow>(
  props: DataTableProps<TRow>,
  parts: {
    table: TanStackTable<TRow>;
    byId: TavolaModel<TRow>['specs'];
    query: TableQuery;
    setQuery: TavolaModel<TRow>['setQuery'];
    layout: TavolaModel<TRow>['layout'];
    setLayout: TavolaModel<TRow>['setLayout'];
    resetLayout: () => void;
    defaults: TavolaModel<TRow>['defaults'];
    server: ReturnType<typeof useServerRows<TRow>>;
    selection: ReturnType<typeof useSelection<TRow>>;
    selectable: boolean;
    serverMode: boolean;
    bulkActions: TavolaModel<TRow>['bulkActions'];
    pageSizes: readonly number[];
    measureScroller: TavolaModel<TRow>['measureScroller'];
  },
): TavolaModel<TRow> {
  const { table, server, selection, serverMode } = parts;
  const locale = useMemo(() => ({ ...defaultLocale, ...props.locale }), [props.locale]);
  const saved = useSavedViews(props.id, { views: props.views, onViewsChange: props.onViewsChange });
  const formats = useMemo(
    () => ({
      number: new Intl.NumberFormat(locale.language),
      date: new Intl.DateTimeFormat(locale.language, { dateStyle: 'medium' }),
    }),
    [locale.language],
  );
  return {
    ...parts,
    specs: parts.byId,
    locale,
    formats,
    loading: serverMode ? server.loading : props.loading === true,
    error: serverMode ? server.error : (props.error ?? null),
    retry: serverMode ? server.retry : undefined,
    total: serverMode ? server.total : table.getFilteredRowModel().rows.length,
    canNextPage: server.hasNext ?? table.getCanNextPage(),
    allMatching: selection.allMatching,
    setAllMatching: selection.setAllMatching,
    getSelection: () => selection.build(table),
    views: saved.views,
    setViews: saved.setViews,
    presets: props.columnPresets ?? NO_PRESETS,
    columnSummary: props.columnSummary !== false,
    classNames: props.classNames ?? {},
    onRowClick: props.onRowClick,
    toolbar: props.toolbar,
    empty: props.empty,
    label: props.label,
  };
}
