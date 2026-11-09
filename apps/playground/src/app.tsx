import { DataTable, useUrlQuery, type BulkAction, type TableTheme } from '@tavola/react';
import { useCallback, useMemo, useState, type ReactElement } from 'react';

import { fetchUsers } from './data/fake-api.ts';
import { generateUsers } from './data/generate-users.ts';
import type { User } from './data/user.type.ts';
import { PageHeader } from './page-header.tsx';
import { userColumns } from './user-columns.tsx';

/** Rows in the client-side example. */
const CLIENT_ROWS = 500;

/** Rows for the client-side example: everything in memory. */
const USERS = generateUsers(CLIENT_ROWS);

/** One-click column sets in the column picker. */
const PRESETS = [
  { label: 'Access review', columns: ['name', 'role', 'status', 'mfa', 'lastSeenAt'] },
  { label: 'Contact', columns: ['name', 'email', 'team', 'country'] },
];

/** Lines kept in the event log. */
const LOG_LINES = 6;

/** How long the pretend delete takes, to show the disabled bulk bar. */
const DELETE_MS = 600;

/**
 * The row id: the database id, never the array index.
 * @param user The row.
 * @returns Its id.
 */
const getRowId = (user: User): string => user.id;

/**
 * The data mode from the URL, so a reload keeps showing the server example.
 * @returns The mode.
 */
function modeFromUrl(): 'client' | 'server' {
  return new URLSearchParams(location.search).get('mode') === 'server' ? 'server' : 'client';
}

/**
 * The bulk actions of the users table.
 * @param note Writes a line to the event log.
 * @returns The actions.
 */
function bulkActions(note: (line: string) => void): BulkAction<User>[] {
  return [
    {
      label: 'Export',
      onAction: (selection) =>
        note(
          selection.allMatching
            ? 'Export all matching rows'
            : `Export ${String(selection.ids.length)} rows`,
        ),
    },
    {
      label: 'Delete',
      danger: true,
      onAction: async (selection) => {
        await new Promise((resolve) => setTimeout(resolve, DELETE_MS));
        note(`Deleted ${String(selection.ids.length)} rows`);
        selection.clear();
      },
    },
  ];
}

/**
 * The latest events the table reported, newest first.
 * @param props The log lines.
 * @returns The log.
 */
function EventLog({ lines }: { lines: string[] }): ReactElement {
  return (
    <section className="log" aria-label="Events">
      <h2>Events</h2>
      <ol>
        {lines.map((line, index) => (
          <li key={`${String(index)}-${line}`}>{line}</li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The playground: the same table in browser and server mode, with a theme switch and a log of
 * what the table reports.
 * @returns The page.
 */
export function App(): ReactElement {
  const [mode, setMode] = useState(modeFromUrl);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [tableTheme, setTableTheme] = useState<TableTheme>('cotto');
  const [log, setLog] = useState<string[]>([]);
  const note = useCallback(
    (line: string): void => setLog((lines) => [line, ...lines].slice(0, LOG_LINES)),
    [],
  );
  const columns = useMemo(
    () =>
      userColumns({
        edit: (user) => note(`Edit ${user.name}`),
        remove: (user) => note(`Delete ${user.name}`),
      }),
    [note],
  );
  const actions = useMemo(() => bulkActions(note), [note]);
  // Server mode keeps its query in the URL: filter, then reload or share the link.
  const url = useUrlQuery({ prefix: 'users.' });

  return (
    <main className="page" data-theme={theme}>
      <PageHeader
        mode={mode}
        onMode={(next) => {
          setMode(next);
          history.replaceState(null, '', next === 'server' ? '?mode=server' : location.pathname);
        }}
        theme={theme}
        onTheme={setTheme}
        tableTheme={tableTheme}
        onTableTheme={setTableTheme}
      />
      <DataTable
        key={mode}
        id={`playground-users-${mode}`}
        label="Users"
        theme={tableTheme}
        columns={columns}
        getRowId={getRowId}
        {...(mode === 'client'
          ? { data: USERS, onQueryChange: (query) => note(`Query ${JSON.stringify(query)}`) }
          : { fetcher: fetchUsers, ...url })}
        bulkActions={actions}
        columnPresets={PRESETS}
        toolbar={
          <button type="button" className="tv-button" onClick={() => note('Invite user')}>
            Invite user
          </button>
        }
        onRowClick={(user) => note(`Open ${user.name}`)}
      />
      <EventLog lines={log} />
    </main>
  );
}
