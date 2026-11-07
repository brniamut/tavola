import { useCallback, useEffect, useState } from 'react';

import type { TableQuery } from '../table/table-query.type.ts';
import { useLatest } from '../table/use-latest.ts';
import { queryToSearchParams } from './query-to-search-params.ts';
import { searchParamsToQuery } from './search-params-to-query.ts';
import type { UseUrlQueryOptions } from './url-query-options.type.ts';

/**
 * Reads the query from the current URL, filling in the defaults where the URL has nothing.
 * @param options The URL options and default query.
 * @returns The query.
 */
function readUrl(options: UseUrlQueryOptions): TableQuery {
  const fromUrl = searchParamsToQuery(
    typeof location === 'undefined' ? '' : location.search,
    options,
  );
  const defaults = options.defaultQuery ?? {};
  return {
    sort: fromUrl.sort.length > 0 ? fromUrl.sort : (defaults.sort ?? []),
    filters: Object.keys(fromUrl.filters).length > 0 ? fromUrl.filters : (defaults.filters ?? {}),
    search: fromUrl.search || (defaults.search ?? ''),
    page: fromUrl.page,
  };
}

/**
 * Keeps the table query in the browser URL, so a filtered, sorted view can be bookmarked and
 * shared, and the back button restores it. Spread the result on the table:
 *
 * @example
 * <DataTable {...useUrlQuery()} columns={columns} fetcher={fetchUsers} getRowId={(u) => u.id} />
 *
 * Works without a router. With a router that owns the URL (Next, TanStack Router), use
 * `queryToSearchParams` and `searchParamsToQuery` with the router's own navigation instead.
 * @param options A prefix for more than one table per page, the default query, and whether
 *   changes replace the history entry (default) or push a new one.
 * @returns `query` and `onQueryChange` for `<DataTable>`.
 */
export function useUrlQuery(options: UseUrlQueryOptions = {}): {
  query: TableQuery;
  onQueryChange: (query: TableQuery) => void;
} {
  const [query, setQuery] = useState(() => readUrl(options));
  const latest = useLatest(options);

  useEffect(() => {
    const onPop = (): void => setQuery(readUrl(latest.current));
    globalThis.addEventListener('popstate', onPop);
    return () => globalThis.removeEventListener('popstate', onPop);
  }, [latest]);

  const onQueryChange = useCallback(
    (next: TableQuery) => {
      setQuery(next);
      const params = queryToSearchParams(next, latest.current, location.search);
      const search = params.toString();
      const url = `${location.pathname}${search ? `?${search}` : ''}${location.hash}`;
      if (latest.current.history === 'push') history.pushState(history.state, '', url);
      else history.replaceState(history.state, '', url);
    },
    [latest],
  );

  return { query, onQueryChange };
}
