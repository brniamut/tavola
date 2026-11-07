import type { FetchResult, TableQuery } from '../table/table-query.type.ts';

/**
 * The part of a query that decides which rows exist: everything but the page index. Cursors are
 * only valid within one such scope; a new sort or filter starts a new list of cursors.
 * @param query The query.
 * @returns A string key for the scope.
 */
function scopeOf(query: TableQuery): string {
  return JSON.stringify([query.sort, query.filters, query.search, query.page.size]);
}

/**
 * Remembers the cursors a cursor-paging API returned, one per page, so the table can go forward
 * and back. Until the API returns a `nextCursor`, queries pass through unchanged, so offset APIs
 * never see a cursor.
 * @returns `withCursor` to add the cursor to a query (null when the page cannot be reached
 *   because its cursor is unknown), and `record` to store the cursor a page returned.
 */
export function createCursorBook(): {
  withCursor: (query: TableQuery) => TableQuery | null;
  record: (query: TableQuery, result: FetchResult<unknown>) => void;
} {
  const books = new Map<string, (string | null)[]>();
  let cursorMode = false;
  return {
    withCursor: (query) => {
      if (!cursorMode) return query;
      const cursor = (books.get(scopeOf(query)) ?? [null])[query.page.index];
      if (cursor === undefined) return null;
      return { ...query, page: { ...query.page, cursor } };
    },
    record: (query, result) => {
      if (!('nextCursor' in result)) return;
      cursorMode = true;
      const scope = scopeOf(query);
      const cursors = books.get(scope) ?? [null];
      cursors[query.page.index + 1] = result.nextCursor;
      books.set(scope, cursors);
    },
  };
}
