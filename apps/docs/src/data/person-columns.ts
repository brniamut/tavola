import { defineColumns, type ColumnSpec } from '@tavola/react';

import type { Person } from './person.type.ts';

/** The columns every docs example uses, defined once at module level. */
export const personColumns: ColumnSpec<Person>[] = defineColumns<Person>((col) => [
  col.text('name', { pin: 'start', size: 190 }),
  col.text('email', { size: 230 }),
  col.enum('role', {
    options: [
      { value: 'admin', label: 'Admin' },
      { value: 'editor', label: 'Editor' },
      { value: 'viewer', label: 'Viewer' },
    ],
    size: 120,
  }),
  col.enum('team', {
    options: ['Platform', 'Design', 'Growth', 'Support'],
    size: 130,
    priority: 2,
  }),
  col.number('logins', { size: 110, priority: 3 }),
  col.date('joined', { size: 140, priority: 1 }),
  col.boolean('active', { size: 100 }),
]);
