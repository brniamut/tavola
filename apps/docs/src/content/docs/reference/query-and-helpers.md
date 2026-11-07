---
title: Query, fetcher and helpers
description: TableQuery, the fetcher contract, and the URL and caching helpers.
sidebar:
  order: 3
---

## TableQuery

```ts
interface TableQuery {
  sort: SortRule[]; // { id: string; desc: boolean }, most significant first
  filters: Record<string, FilterValue>;
  search: string;
  page: PageRequest; // { index: number; size: number; cursor?: string | null }
}
```

`FilterValue` per kind: text `string`; number `{ min?, max? }`; date `{ from?, to? }` (`YYYY-MM-DD`); enum `unknown[]`; boolean `boolean`.

## Fetcher

```ts
type Fetcher<Row> = (
  query: TableQuery,
  context: { signal: AbortSignal },
) => Promise<FetchResult<Row>>;

type FetchResult<Row> =
  | { rows: Row[]; total: number } // offset paging
  | { rows: Row[]; nextCursor: string | null; total?: number }; // cursor paging
```

## useUrlQuery

```ts
function useUrlQuery(options?: {
  prefix?: string;
  defaultPageSize?: number; // default 25
  defaultQuery?: Partial<TableQuery>;
  history?: 'replace' | 'push'; // default 'replace'
}): { query: TableQuery; onQueryChange: (query: TableQuery) => void };
```

## queryToSearchParams and searchParamsToQuery

```ts
function queryToSearchParams(
  query: TableQuery,
  options?: UrlQueryOptions,
  base?: URLSearchParams | string,
): URLSearchParams;
function searchParamsToQuery(
  params: URLSearchParams | string,
  options?: UrlQueryOptions,
): TableQuery;
```

Parameters: `sort` (`name,-logins`), `q`, `page` (from 1), `size`, `filter` (JSON). Defaults are left out; other parameters in `base` are kept.

## queryClientFetcher

```ts
function queryClientFetcher<Row>(
  client: QueryClient,
  options: { queryKey: readonly unknown[]; queryFn: Fetcher<Row>; staleTime?: number },
): Fetcher<Row>;
```

The table query is appended to `queryKey`.

## Locale

All texts, overridable with the `locale` prop. Functions receive counts: `selected(count)`, `selectAllMatching(total)`, `allMatchingSelected(total)`, `range(first, last, total)`; `total` is `null` when a cursor API gives none. `language` sets the formatting of numbers and dates. The English defaults are exported as `defaultLocale`.
