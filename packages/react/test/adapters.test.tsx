import { QueryClient } from '@tanstack/query-core';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  queryClientFetcher,
  queryToSearchParams,
  searchParamsToQuery,
  useUrlQuery,
  type TableQuery,
} from '../src/index.ts';
import { users, type User } from './fixtures.ts';

const query: TableQuery = {
  sort: [
    { id: 'name', desc: false },
    { id: 'logins', desc: true },
  ],
  filters: { role: ['admin', 'editor'], logins: { min: 5 } },
  search: 'ada',
  page: { index: 2, size: 50 },
};

describe('URL search parameters', () => {
  it('writes a readable URL and reads it back to the same query', () => {
    const params = queryToSearchParams(query);
    expect(params.get('sort')).toBe('name,-logins');
    expect(params.get('q')).toBe('ada');
    expect(params.get('page')).toBe('3');
    expect(searchParamsToQuery(params)).toEqual(query);
  });

  it('leaves defaults out and keeps unrelated parameters', () => {
    const empty: TableQuery = { sort: [], filters: {}, search: '', page: { index: 0, size: 25 } };
    expect(queryToSearchParams(empty, {}, 'tab=users').toString()).toBe('tab=users');
  });

  it('keeps two tables apart with a prefix', () => {
    const params = queryToSearchParams(query, { prefix: 'users.' });
    expect(params.get('users.q')).toBe('ada');
    expect(searchParamsToQuery(params, { prefix: 'orders.' }).search).toBe('');
  });

  it('turns a broken URL into the default query instead of throwing', () => {
    const parsed = searchParamsToQuery('page=-4&size=abc&filter={not json');
    expect(parsed.page).toEqual({ index: 0, size: 25 });
    expect(parsed.filters).toEqual({});
  });
});

describe('useUrlQuery', () => {
  it('starts from the URL and writes changes back with replaceState', () => {
    history.replaceState(null, '', '/users?q=grace&keep=1');
    const { result } = renderHook(() =>
      useUrlQuery({ defaultQuery: { sort: [{ id: 'name', desc: false }] } }),
    );
    expect(result.current.query.search).toBe('grace');
    expect(result.current.query.sort).toEqual([{ id: 'name', desc: false }]);

    act(() => result.current.onQueryChange({ ...result.current.query, search: 'ada' }));
    expect(location.search).toBe('?q=ada&keep=1&sort=name');
    expect(result.current.query.search).toBe('ada');
  });
});

describe('queryClientFetcher', () => {
  it('fetches through a real QueryClient and serves a repeated query from the cache', async () => {
    const client = new QueryClient();
    const queryFn = vi.fn(async () => ({ rows: users, total: users.length }));
    const fetcher = queryClientFetcher<User>(client, {
      queryKey: ['users'],
      queryFn,
      staleTime: 60_000,
    });
    const signal = new AbortController().signal;

    expect((await fetcher(query, { signal })).total).toBe(users.length);
    await fetcher(query, { signal });
    expect(queryFn).toHaveBeenCalledTimes(1);
    expect(client.getQueryData(['users', query])).toBeTruthy();
  });
});
