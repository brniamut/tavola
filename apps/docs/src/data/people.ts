import type { Person } from './person.type.ts';

const NAMES = [
  'Ada Lovelace',
  'Grace Hopper',
  'Alan Turing',
  'Edsger Dijkstra',
  'Barbara Liskov',
  'Donald Knuth',
  'Margaret Hamilton',
  'Ken Thompson',
  'Radia Perlman',
  'Frances Allen',
  'Hedy Lamarr',
  'Katherine Johnson',
  'Niklaus Wirth',
  'Sophie Wilson',
  'Bjarne Stroustrup',
  'Guido van Rossum',
];
const ROLES: Person['role'][] = ['admin', 'editor', 'editor', 'viewer', 'viewer', 'viewer'];
const TEAMS = ['Platform', 'Design', 'Growth', 'Support'];

/** Days of history the join dates are spread over. */
const HISTORY_DAYS = 700;
const DAY_MS = 86_400_000;
/** A fixed "today", so every visitor sees the same rows. */
const TODAY = Date.UTC(2026, 10, 7);

/**
 * Example rows: always the same, so the docs and their screenshots stay stable.
 * @param count How many people.
 * @returns The people.
 */
export function people(count: number): Person[] {
  return Array.from({ length: count }, (_, index) => {
    const name = NAMES[index % NAMES.length] ?? 'Ada Lovelace';
    return {
      id: `p${String(index + 1)}`,
      name: index < NAMES.length ? name : `${name} ${String(Math.floor(index / NAMES.length) + 1)}`,
      email: `${name.split(' ')[0]?.toLowerCase() ?? 'user'}${String(index)}@example.com`,
      role: ROLES[(index * 7) % ROLES.length] ?? 'viewer',
      team: TEAMS[(index * 3) % TEAMS.length] ?? 'Platform',
      logins: (index * 37) % 211,
      joined: new Date(TODAY - ((index * 53) % HISTORY_DAYS) * DAY_MS).toISOString().slice(0, 10),
      active: index % 5 !== 0,
    };
  });
}
