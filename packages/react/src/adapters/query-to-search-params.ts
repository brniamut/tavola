import type { TableQuery } from '../table/table-query.type.ts';
import type { UrlQueryOptions } from './url-query-options.type.ts';

/** The page size left out of the URL unless the options say otherwise. */
export const DEFAULT_URL_PAGE_SIZE = 25;

/**
 * The URL parameters of a query, with null for those at their default, to be removed.
 * @param query The table query.
 * @param options The default page size.
 * @returns Parameter names without prefix, and their values.
 */
function urlEntries(query: TableQuery, options: UrlQueryOptions): [string, string | null][] {
  const sort = query.sort.map((rule) => (rule.desc ? `-${rule.id}` : rule.id)).join(',');
  const defaultSize = options.defaultPageSize ?? DEFAULT_URL_PAGE_SIZE;
  return [
    ['sort', sort || null],
    ['q', query.search || null],
    ['page', query.page.index > 0 ? String(query.page.index + 1) : null],
    ['size', query.page.size === defaultSize ? null : String(query.page.size)],
    ['filter', Object.keys(query.filters).length > 0 ? JSON.stringify(query.filters) : null],
  ];
}

/**
 * Writes a query into URL search parameters that people can read and share:
 * `sort=name,-logins`, `q=ada`, `page=2` (counting from 1), `size=50`, and the column filters as
 * JSON in `filter`. Defaults are left out, so an untouched table has a clean URL. Other
 * parameters in `base` are kept.
 * @example
 * router.replace(`?${queryToSearchParams(query)}`);
 * @param query The table query.
 * @param options A prefix per table, and the default page size.
 * @param base Existing parameters to keep, such as the current `location.search`.
 * @returns The parameters.
 */
export function queryToSearchParams(
  query: TableQuery,
  options: UrlQueryOptions = {},
  base: URLSearchParams | string = '',
): URLSearchParams {
  const params = new URLSearchParams(base);
  const prefix = options.prefix ?? '';
  for (const [name, value] of urlEntries(query, options)) {
    if (value === null) params.delete(prefix + name);
    else params.set(prefix + name, value);
  }
  return params;
}
