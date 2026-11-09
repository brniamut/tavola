// The public API of @tavola/react. Everything else is internal and may change in any release.
export { DataTable } from './data-table.tsx';
export { defineColumns } from './columns/define-columns.ts';
export { defaultLocale } from './locale/default-locale.ts';
export { useUrlQuery } from './adapters/use-url-query.ts';
export { queryToSearchParams } from './adapters/query-to-search-params.ts';
export { searchParamsToQuery } from './adapters/search-params-to-query.ts';
export { queryClientFetcher } from './adapters/query-client-fetcher.ts';

export type { QueryClientLike } from './adapters/query-client-like.type.ts';
export type { UrlQueryOptions, UseUrlQueryOptions } from './adapters/url-query-options.type.ts';

export type { ColumnBuilder } from './columns/column-builder.type.ts';
export type {
  CellClassName,
  CellContext,
  ColumnAlign,
  ColumnKind,
  ColumnPin,
  ColumnSpec,
  DataColumnOptions,
  DisplayColumnOptions,
  EnumColumnOptions,
  EnumOption,
  RowAction,
} from './columns/column-spec.type.ts';
export type {
  BooleanFilter,
  DateRangeFilter,
  EnumFilter,
  FilterValue,
  NumberRangeFilter,
  TextFilter,
} from './filters/filter-value.type.ts';
export type { Density, TableLayout } from './layout/layout.type.ts';
export type { Locale } from './locale/locale.type.ts';
export type {
  BulkAction,
  DataTableProps,
  Selection,
  TablePart,
  TableTheme,
} from './table/data-table-props.type.ts';
export type {
  CursorPage,
  FetchResult,
  Fetcher,
  OffsetPage,
  PageRequest,
  SortRule,
  TableQuery,
} from './table/table-query.type.ts';
export type { TanStackTable } from './table/tanstack.type.ts';
export type { ColumnPreset, SavedView, ViewLayout, ViewQuery } from './views/saved-view.type.ts';
