import { useCallback, useEffect, useRef, useState } from 'react';

import type { Fetcher, FetchResult, TableQuery } from '../table/table-query.type.ts';
import { useLatest } from '../table/use-latest.ts';
import { createCursorBook } from './create-cursor-book.ts';
import type { ServerRows } from './server-rows.type.ts';

/**
 * Wait before fetching after the query changes, in milliseconds, so typing in the search box or
 * a filter sends one request instead of one per keystroke. The first fetch does not wait.
 */
const DEBOUNCE_MS = 250;

/** One empty array for every table, so "no rows yet" never changes identity. */
const NO_ROWS: never[] = [];

/**
 * What the table knows from the last settled page: its total, and for cursor APIs whether
 * another page follows.
 * @param result The last page, or null before the first answer.
 * @returns The total (null when unknown) and whether a next page exists (null for offset APIs).
 */
function pageInfo(
  result: FetchResult<unknown> | null,
): Pick<ServerRows<unknown>, 'total' | 'hasNext'> {
  if (!result) return { total: 0, hasNext: null };
  if ('nextCursor' in result)
    return { total: result.total ?? null, hasNext: result.nextCursor !== null };
  return { total: result.total, hasNext: null };
}

/**
 * Fetches the page for the current query whenever it changes. The previous request is aborted,
 * a late answer to an old query is ignored, and the previous rows stay visible while the next
 * page loads, so the table does not flicker to empty. Loading is derived: the table is loading
 * while the last settled request is not the current one. Cursor APIs get the cursor of the page
 * they are asked for; a page whose cursor is unknown (a restored page number) sends the table
 * back to the first page.
 * @param fetcher The developer's fetch function, or undefined in client mode.
 * @param query The current query.
 * @param onCursorMissing Called when the page asked for cannot be reached with a cursor.
 * @returns The rows, the total, loading and error state, and a retry function.
 */
export function useServerRows<TRow>(
  fetcher: Fetcher<TRow> | undefined,
  query: TableQuery,
  onCursorMissing: () => void,
): ServerRows<TRow> {
  const [attempt, setAttempt] = useState(0);
  // The query as a string, so a structurally equal query does not refetch.
  const json = JSON.stringify(query);
  const request = `${String(attempt)}:${json}`;
  const [settled, setSettled] = useState<{
    request: string;
    result: FetchResult<TRow> | null;
    error: unknown;
  }>({
    request: '',
    result: null,
    error: null,
  });
  const [book] = useState(createCursorBook);
  const lastResult = useRef<FetchResult<TRow> | null>(null);
  const latest = useLatest({ fetcher, onCursorMissing });

  useEffect(() => {
    const { fetcher: fetch } = latest.current;
    const asked = JSON.parse(json) as TableQuery;
    const withCursor = book.withCursor(asked);
    if (!fetch) return;
    if (!withCursor) return latest.current.onCursorMissing();
    const controller = new AbortController();
    const settle = (result: FetchResult<TRow> | null, error: unknown): void => {
      if (controller.signal.aborted) return;
      if (result) book.record(asked, result);
      lastResult.current = result ?? lastResult.current;
      setSettled({ request, result: lastResult.current, error });
    };
    const timer = setTimeout(
      () => {
        void fetch(withCursor, { signal: controller.signal }).then(
          (result) => settle(result, null),
          (error: unknown) => settle(null, error),
        );
      },
      lastResult.current ? DEBOUNCE_MS : 0,
    );
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [request, json, latest, book]);

  const retry = useCallback(() => setAttempt((count) => count + 1), []);
  return {
    rows: settled.result?.rows ?? NO_ROWS,
    ...pageInfo(settled.result),
    loading: fetcher !== undefined && settled.request !== request,
    error: settled.request === request ? settled.error : null,
    retry,
  };
}
