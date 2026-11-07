import type { User } from './user.type.ts';

const FIRST = [
  'Ada',
  'Grace',
  'Alan',
  'Edsger',
  'Barbara',
  'Donald',
  'Margaret',
  'Ken',
  'Radia',
  'Linus',
  'Frances',
  'Tim',
  'Hedy',
  'John',
  'Katherine',
  'Niklaus',
  'Sophie',
  'Guido',
  'Anita',
  'Bjarne',
];
const LAST = [
  'Lovelace',
  'Hopper',
  'Turing',
  'Dijkstra',
  'Liskov',
  'Knuth',
  'Hamilton',
  'Thompson',
  'Perlman',
  'Torvalds',
  'Allen',
  'Berners-Lee',
  'Lamarr',
  'McCarthy',
  'Johnson',
  'Wirth',
  'Wilson',
  'van Rossum',
  'Borg',
  'Stroustrup',
];
const ROLES: User['role'][] = ['owner', 'admin', 'editor', 'editor', 'viewer', 'viewer', 'viewer'];
const STATUSES: User['status'][] = ['active', 'active', 'active', 'active', 'invited', 'suspended'];
const TEAMS = ['Platform', 'Design', 'Growth', 'Support', 'Finance', null];
const COUNTRIES = [
  'Netherlands',
  'Germany',
  'Belgium',
  'United Kingdom',
  'France',
  'Spain',
  'Sweden',
];

/** Days of account history to spread creation dates over. */
const HISTORY_DAYS = 900;
const DAY_MS = 86_400_000;
const MAX_LOGINS = 400;
const MAX_STORAGE_MB = 20_000;
/** Fixed "today", so the data is the same on every load. */
const TODAY = Date.UTC(2026, 10, 7);

/**
 * A small deterministic random generator (mulberry32), so the playground shows the same data on
 * every load and screenshots stay comparable.
 * @param seed The seed.
 * @returns A function returning numbers from 0 up to 1.
 */
function random(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d_2b_79_f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4_294_967_296;
  };
}

/**
 * Generates fake users for the playground.
 * @param count How many.
 * @returns The users, always the same for the same count.
 */
export function generateUsers(count: number): User[] {
  const next = random(count);
  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)] as T;
  return Array.from({ length: count }, (_, index) => {
    const first = pick(FIRST);
    const last = pick(LAST);
    const created = TODAY - Math.floor(next() * HISTORY_DAYS) * DAY_MS;
    const status = pick(STATUSES);
    const seen = status === 'invited' ? null : created + Math.floor(next() * (TODAY - created));
    return {
      id: `user-${String(index + 1).padStart(4, '0')}`,
      name: `${first} ${last}`,
      email:
        `${first}.${last}`.toLowerCase().replaceAll(/[^a-z.]/g, '') +
        `${String(index)}@example.com`,
      role: pick(ROLES),
      status,
      team: pick(TEAMS),
      country: pick(COUNTRIES),
      logins: status === 'invited' ? 0 : Math.floor(next() * MAX_LOGINS),
      storageMb: Math.round(next() * MAX_STORAGE_MB),
      createdAt: new Date(created).toISOString(),
      lastSeenAt: seen === null ? null : new Date(seen).toISOString(),
      mfa: next() > 0.3,
    };
  });
}
