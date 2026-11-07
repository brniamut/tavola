import '@tavola/react/styles.css';

import { DataTable, defineColumns, type TableTheme } from '@tavola/react';
import { useState, type ReactElement } from 'react';

import type { Person } from '../data/person.type.ts';
import { people } from '../data/people.ts';

/** Rows for the showcase. */
const ROWS = people(40);

/** The presets, with what each is for. */
const THEMES: { theme: TableTheme; name: string; note: string }[] = [
  {
    theme: 'cotto',
    name: 'Cotto',
    note: 'The default: warm paper and ink with a terracotta accent.',
  },
  {
    theme: 'ink',
    name: 'Ink',
    note: 'Monochrome zinc with a black accent. Neutral in any product.',
  },
  { theme: 'basil', name: 'Basil', note: 'Green on cool paper. Calm, for long sessions.' },
  {
    theme: 'harbor',
    name: 'Harbor',
    note: 'Slate and blue: the familiar SaaS look, for apps that want to blend in.',
  },
  {
    theme: 'ledger',
    name: 'Ledger',
    note: 'An account book: square, ruled columns, striped rows, figures in mono.',
  },
];

/** The showcase columns, with status badges in the role column. */
const columns = defineColumns<Person>((col) => [
  col.text('name', { pin: 'start', size: 180 }),
  col.enum('role', {
    options: ['admin', 'editor', 'viewer'],
    size: 120,
    cell: ({ value }) => (
      <span
        className="tv-badge"
        data-tone={{ admin: 'warning', editor: 'info', viewer: 'neutral' }[value]}
      >
        {value}
      </span>
    ),
  }),
  col.enum('team', { options: ['Platform', 'Design', 'Growth', 'Support'], size: 130 }),
  col.number('logins', { size: 100 }),
  col.date('joined', { size: 140 }),
  col.boolean('active', {
    size: 110,
    cell: ({ value }) => (
      <span className="tv-badge" data-tone={value ? 'success' : 'danger'}>
        {value ? 'Active' : 'Suspended'}
      </span>
    ),
  }),
  col.actions(() => [{ label: 'Edit', onSelect: () => undefined }]),
]);

/**
 * The row id.
 * @param person The row.
 * @returns Its id.
 */
const getRowId = (person: Person): string => person.id;

/**
 * One table with a switcher for the built-in themes. The site's light and dark toggle applies too.
 * @returns The showcase.
 */
export function ThemeShowcase(): ReactElement {
  const [current, setCurrent] = useState<TableTheme>('cotto');
  const active = THEMES.find((entry) => entry.theme === current) ?? THEMES[0];
  return (
    <div className="example">
      <fieldset className="theme-switch">
        <legend className="tv-visually-hidden">Theme</legend>
        {THEMES.map((entry) => (
          <label key={entry.theme}>
            <input
              type="radio"
              name="theme-showcase"
              checked={entry.theme === current}
              onChange={() => setCurrent(entry.theme)}
            />
            <span>{entry.name}</span>
          </label>
        ))}
      </fieldset>
      <p className="theme-note">
        {active?.note} <code>{`<DataTable theme="${current}" />`}</code>
      </p>
      <DataTable
        label="People"
        theme={current}
        columns={columns}
        data={ROWS}
        getRowId={getRowId}
        selectable
        pageSizes={[10, 25]}
        defaultQuery={{ sort: [{ id: 'logins', desc: true }] }}
      />
    </div>
  );
}
