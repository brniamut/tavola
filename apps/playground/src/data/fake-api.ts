import type { FetchResult, TableQuery } from '@tavola/react';

import { generateUsers } from './generate-users.ts';
import type { User } from './user.type.ts';

/** The "database": more rows than anyone would load into the browser at once. */
const DATABASE = generateUsers(5000);

/** Simulated network latency, in milliseconds. */
const LATENCY_MS = 450;

/**
 * Whether a user passes one filter from the query, as a real API would check it.
 * @param user The row.
 * @param id The column id.
 * @param filter The filter value.
 * @returns True when the row stays.
 */
function passes(user: User, id: string, filter: unknown): boolean {
  const value = user[id as keyof User];
  if (Array.isArray(filter)) return filter.includes(value);
  if (typeof filter === 'string')
    return String(value ?? '')
      .toLowerCase()
      .includes(filter.toLowerCase());
  if (typeof filter === 'boolean') return value === filter;
  const { min, max, from, to } = filter as Record<string, number | string | undefined>;
  const low = min ?? from;
  const high = max ?? to;
  if (value === null) return false;
  const comparable =
    typeof low === 'string' || typeof high === 'string' ? String(value).slice(0, 10) : value;
  return (low === undefined || comparable >= low) && (high === undefined || comparable <= high);
}

/**
 * Compares two users by the query's sort rules.
 * @param query The query.
 * @returns A comparator.
 */
function comparator(query: TableQuery): (left: User, right: User) => number {
  return (left, right) => {
    for (const rule of query.sort) {
      const first = left[rule.id as keyof User] ?? '';
      const second = right[rule.id as keyof User] ?? '';
      const order = first < second ? -1 : Number(first > second);
      if (order !== 0) return rule.desc ? -order : order;
    }
    return 0;
  };
}

/**
 * A pretend API endpoint: filters, searches, sorts and pages 5000 users after a delay, and
 * honours the abort signal. This is the shape of the code you write against your own backend.
 * @param query The table's query.
 * @param context The abort signal.
 * @returns The page and the total.
 */
export async function fetchUsers(
  query: TableQuery,
  { signal }: { signal: AbortSignal },
): Promise<FetchResult<User>> {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, LATENCY_MS);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
  const search = query.search.toLowerCase();
  const matching = DATABASE.filter(
    (user) =>
      (search === '' || `${user.name} ${user.email}`.toLowerCase().includes(search)) &&
      Object.entries(query.filters).every(([id, filter]) => passes(user, id, filter)),
  ).toSorted(comparator(query));
  const start = query.page.index * query.page.size;
  return { rows: matching.slice(start, start + query.page.size), total: matching.length };
}
