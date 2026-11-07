import type { FilterValue } from '../filters/filter-value.type.ts';

/** One sort rule. The first rule in `TableQuery.sort` sorts first. */
export interface SortRule {
  /** Column id. */
  id: string;
  /** Descending when true. */
  desc: boolean;
}

/** Which page is shown. */
export interface PageRequest {
  /** Zero-based page number. */
  index: number;
  /** Rows per page. */
  size: number;
  /**
   * For APIs that page with a cursor: the `nextCursor` your fetcher returned for the previous
   * page, or null for the first page. Present only once your fetcher has returned a
   * `nextCursor`; offset-based APIs never see it.
   */
  cursor?: string | null;
}

/**
 * Everything that decides which rows the table shows, as one plain, serialisable object. In
 * server mode this is what your `fetcher` receives; it is also what `onQueryChange` reports and
 * what you can put in the URL.
 */
export interface TableQuery {
  /** Sort rules, most significant first. Empty when unsorted. */
  sort: SortRule[];
  /** Column filters by column id. Columns without a filter are absent. */
  filters: Record<string, FilterValue>;
  /** The search box text. Empty when not searching. */
  search: string;
  /** The page. Resets to the first page when sort, filters or search change. */
  page: PageRequest;
}

/** A page from an API that pages by offset: the table knows the total and every page. */
export interface OffsetPage<TRow> {
  /** The rows of the requested page, already sorted and filtered. */
  rows: TRow[];
  /** The number of rows matching the filters across all pages. */
  total: number;
}

/**
 * A page from an API that pages with a cursor. The table sends `nextCursor` back as
 * `query.page.cursor` to get the next page, and goes back to the first page when sort, filters
 * or search change.
 */
export interface CursorPage<TRow> {
  /** The rows of the requested page, already sorted and filtered. */
  rows: TRow[];
  /** The cursor of the next page, or null on the last page. */
  nextCursor: string | null;
  /** The number of matching rows, when your API knows it. Without it the footer shows no total. */
  total?: number | undefined;
}

/** What a server-mode `fetcher` returns: an offset page or a cursor page. */
export type FetchResult<TRow> = OffsetPage<TRow> | CursorPage<TRow>;

/** Fetches one page of rows for a query. Abort your request when `signal` fires. */
export type Fetcher<TRow> = (
  query: TableQuery,
  context: { signal: AbortSignal },
) => Promise<FetchResult<TRow>>;
