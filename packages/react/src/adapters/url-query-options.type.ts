import type { TableQuery } from '../table/table-query.type.ts';

/** Options for reading and writing the query in the URL. */
export interface UrlQueryOptions {
  /**
   * Put before every parameter name, for more than one table on a page: with `users.` the sort
   * is in `users.sort`. Default none.
   */
  prefix?: string | undefined;
  /** The page size that is left out of the URL because it is the default. Default 25. */
  defaultPageSize?: number | undefined;
}

/** Options of `useUrlQuery`. */
export interface UseUrlQueryOptions extends UrlQueryOptions {
  /** Sort, filters or search to use when the URL has none. */
  defaultQuery?: Partial<TableQuery> | undefined;
  /** `replace` (default) keeps the back button for real navigation; `push` adds a history entry per change. */
  history?: 'replace' | 'push' | undefined;
}
