import { defineColumns, type ColumnSpec } from '@tavola/react';

import type { User } from './data/user.type.ts';

/** The roles, with their labels. */
const ROLES = [
  { value: 'owner', label: 'Owner' },
  { value: 'admin', label: 'Admin' },
  { value: 'editor', label: 'Editor' },
  { value: 'viewer', label: 'Viewer' },
] as const;

/** Bytes per megabyte, for the storage column. */
const MB_PER_GB = 1024;

/**
 * The columns of the users table. Defined once, outside any component.
 * @param actions What the row menu does.
 * @returns The columns.
 */
export function userColumns(actions: {
  edit: (user: User) => void;
  remove: (user: User) => void;
}): ColumnSpec<User>[] {
  return defineColumns<User>((col) => [
    col.text('name', { group: 'Person', pin: 'start', size: 200 }),
    col.text('email', { group: 'Contact', size: 260 }),
    col.enum('role', {
      group: 'Access',
      options: ROLES,
      size: 120,
    }),
    col.enum('status', {
      group: 'Access',
      options: ['active', 'invited', 'suspended'],
      size: 130,
      cell: ({ value }) => (
        <span
          className="tv-badge"
          data-tone={{ active: 'success', invited: 'info', suspended: 'danger' }[value]}
        >
          {value}
        </span>
      ),
    }),
    col.enum('team', {
      group: 'Organisation',
      options: ['Platform', 'Design', 'Growth', 'Support', 'Finance'],
      size: 130,
    }),
    col.enum('country', {
      group: 'Organisation',
      options: ['Netherlands', 'Germany', 'Belgium', 'United Kingdom', 'France', 'Spain', 'Sweden'],
      hidden: true,
    }),
    col.number('logins', { group: 'Activity', size: 110, priority: 3 }),
    col.number('storageMb', {
      group: 'Usage',
      header: 'Storage',
      size: 120,
      priority: 4,
      cell: ({ value }) =>
        value >= MB_PER_GB ? `${(value / MB_PER_GB).toFixed(1)} GB` : `${String(value)} MB`,
    }),
    col.date('createdAt', { group: 'Activity', header: 'Created', size: 140 }),
    col.date('lastSeenAt', { group: 'Activity', header: 'Last seen', size: 140, priority: 5 }),
    col.boolean('mfa', { group: 'Access', header: 'MFA', size: 90, align: 'center', priority: 2 }),
    col.actions((user) => [
      { label: 'Edit', onSelect: () => actions.edit(user) },
      {
        label: 'Delete',
        onSelect: () => actions.remove(user),
        danger: true,
        disabled: user.role === 'owner',
      },
    ]),
  ]);
}
