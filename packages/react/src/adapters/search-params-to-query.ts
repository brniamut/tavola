import type { FilterValue } from '../filters/filter-value.type.ts';
import type { TableQuery } from '../table/table-query.type.ts';
import { DEFAULT_URL_PAGE_SIZE } from './query-to-search-params.ts';
import type { UrlQueryOptions } from './url-query-options.type.ts';

/**
 * Reads the filters parameter. A hand-edited or truncated URL gives no filters rather than an
 * error.
 * @param raw The parameter value, or null.
 * @returns The filters.
 */
function parseFilters(raw: string | null): Record<string, FilterValue> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)
      ? (parsed as Record<string, FilterValue>)
      : {};
  } catch {
    return {};
  }
}

/**
 * Reads a positive whole number, or the fallback.
 * @param raw The parameter value, or null.
 * @param fallback The value to use when it is missing or invalid.
 * @returns The number.
 */
function positive(raw: string | null, fallback: number): number {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

/**
 * Reads a query from URL search parameters written by `queryToSearchParams`. Missing or invalid
 * parameters fall back to defaults, so any URL gives a valid query.
 * @example
 * const query = searchParamsToQuery(new URLSearchParams(location.search));
 * @param params The URL parameters, or a search string.
 * @param options The prefix per table, and the default page size.
 * @returns The query.
 */
export function searchParamsToQuery(
  params: URLSearchParams | string,
  options: UrlQueryOptions = {},
): TableQuery {
  const read = new URLSearchParams(params);
  const prefix = options.prefix ?? '';
  const get = (name: string): string | null => read.get(prefix + name);
  const sort = (get('sort') ?? '')
    .split(',')
    .filter(Boolean)
    .map((part) =>
      part.startsWith('-') ? { id: part.slice(1), desc: true } : { id: part, desc: false },
    );
  return {
    sort,
    filters: parseFilters(get('filter')),
    search: get('q') ?? '',
    page: {
      index: positive(get('page'), 1) - 1,
      size: positive(get('size'), options.defaultPageSize ?? DEFAULT_URL_PAGE_SIZE),
    },
  };
}
