import { describe, expect, it } from 'vitest';

import { defineColumns } from '../src/index.ts';
import type { User } from './fixtures.ts';

/**
 * Type tests: `pnpm typecheck` fails when one of the `@ts-expect-error` lines stops being an error,
 * so the column API keeps rejecting the mistakes it is meant to catch.
 */
describe('defineColumns types', () => {
  it('accepts keys whose value fits the column kind', () => {
    const columns = defineColumns<User>((col) => [
      col.text('name'),
      // A nullable string still counts as text.
      col.text('team'),
      col.number('logins', { cell: ({ value }) => value.toFixed(0) }),
      col.date('createdAt'),
      col.boolean('active'),
      col.enum('role', { options: ['admin', { value: 'editor', label: 'Editor' }] }),
      col.display('summary', { cell: (user) => user.email }),
      col.actions(() => []),
    ]);
    expect(columns).toHaveLength(8);
  });

  it('rejects keys of the wrong kind and options of the wrong type', () => {
    expect(() =>
      defineColumns<User>((col) => [
        // @ts-expect-error -- logins is a number, not text.
        col.text('logins'),
        // @ts-expect-error -- name is a string, not a number.
        col.number('name'),
        // @ts-expect-error -- no such key.
        col.text('missing'),
        // @ts-expect-error -- 'owner' is not a role.
        col.enum('role', { options: ['owner'] }),
        // @ts-expect-error -- an enum column needs its options.
        col.enum('role'),
      ]),
    ).toThrow(/two columns have the id "role"/);
  });

  it('rejects duplicate column ids at runtime', () => {
    expect(() => defineColumns<User>((col) => [col.text('name'), col.text('name')])).toThrow(
      'two columns have the id "name"',
    );
  });
});
