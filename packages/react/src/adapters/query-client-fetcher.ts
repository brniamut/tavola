import type { Fetcher, FetchResult, TableQuery } from '../table/table-query.type.ts';
import type { QueryClientLike } from './query-client-like.type.ts';

/**
 * Wraps a fetch function in TanStack Query, so pages are cached and shared: going back to a page
 * shows it at once, and two tables with the same query fetch once. Tavola does not depend on
 * TanStack Query; pass your own `QueryClient`.
 *
 * @example
 * const queryClient = useQueryClient();
 * const fetcher = useMemo(
 *   () => queryClientFetcher(queryClient, { queryKey: ['users'], queryFn: api.listUsers, staleTime: 30_000 }),
 *   [queryClient],
 * );
 * <DataTable fetcher={fetcher} ... />
 *
 * The table query is appended to `queryKey`, so `queryClient.invalidateQueries({ queryKey: ['users'] })`
 * after a mutation refreshes every page.
 * @param client Your TanStack Query `QueryClient`.
 * @param options The base query key, the fetch function, and how long a page stays fresh.
 * @returns A fetcher for `<DataTable fetcher>`.
 */
export function queryClientFetcher<TRow>(
  client: QueryClientLike,
  options: {
    queryKey: readonly unknown[];
    queryFn: Fetcher<TRow>;
    staleTime?: number | undefined;
  },
): Fetcher<TRow> {
  return async (query: TableQuery) =>
    client.fetchQuery<FetchResult<TRow>>({
      queryKey: [...options.queryKey, query],
      // TanStack Query's own signal: it cancels the request when nothing needs the page anymore.
      queryFn: ({ signal }) => options.queryFn(query, { signal }),
      ...(options.staleTime !== undefined && { staleTime: options.staleTime }),
    });
}
