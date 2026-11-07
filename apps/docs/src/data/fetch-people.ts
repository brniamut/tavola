import type { FetchResult, TableQuery } from '@tavola/react';

import type { Person } from './person.type.ts';
import { people } from './people.ts';

/** The example "database" for the server-mode demo. */
const DATABASE = people(1000);

/** Simulated network delay, in milliseconds, so the loading state is visible. */
const LATENCY_MS = 350;

/**
 * A pretend API: searches, filters by role, sorts and pages, after a delay. Real code calls your
 * backend with the same query.
 * @param query The table query.
 * @param context The abort signal.
 * @returns The page and the total.
 */
export async function fetchPeople(
  query: TableQuery,
  { signal }: { signal: AbortSignal },
): Promise<FetchResult<Person>> {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, LATENCY_MS);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    });
  });
  const search = query.search.toLowerCase();
  const roles = query.filters['role'];
  const rule = query.sort[0];
  const matching = DATABASE.filter(
    (person) =>
      person.name.toLowerCase().includes(search) &&
      (!Array.isArray(roles) || roles.includes(person.role)),
  ).toSorted((left, right) => {
    if (!rule) return 0;
    const first = String(left[rule.id as keyof Person]);
    const second = String(right[rule.id as keyof Person]);
    const order = first.localeCompare(second, 'en', { numeric: true });
    return rule.desc ? -order : order;
  });
  const start = query.page.index * query.page.size;
  return { rows: matching.slice(start, start + query.page.size), total: matching.length };
}
