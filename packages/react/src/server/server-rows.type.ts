/** What the table knows about the server rows. */
export interface ServerRows<TRow> {
  /** The rows of the current page. */
  rows: TRow[];
  /** Rows matching the query across all pages, or null when a cursor API does not say. */
  total: number | null;
  /** Whether a next page exists, when a cursor API tells; null for offset APIs. */
  hasNext: boolean | null;
  /** A request is in flight. */
  loading: boolean;
  /** Why the last request failed, or null. */
  error: unknown;
  /** Repeats the last request. */
  retry: () => void;
}
