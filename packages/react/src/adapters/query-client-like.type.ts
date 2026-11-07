/**
 * The part of TanStack Query's `QueryClient` that `queryClientFetcher` uses. Described here so
 * Tavola needs no dependency on TanStack Query; a real `QueryClient` fits it.
 */
export interface QueryClientLike {
  /**
   * Fetches a query, or returns it from the cache while it is fresh.
   * @param options The query key, the function that fetches, and how long the result stays fresh.
   */
  fetchQuery<TData>(options: {
    queryKey: readonly unknown[];
    queryFn: (context: { signal: AbortSignal }) => Promise<TData>;
    staleTime?: number;
  }): Promise<TData>;
}
