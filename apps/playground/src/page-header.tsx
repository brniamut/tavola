import type { TableTheme } from '@tavola/react';
import type { ReactElement } from 'react';

/** The table themes to pick from. */
const TABLE_THEMES: TableTheme[] = ['cotto', 'ink', 'basil', 'harbor', 'ledger'];

/**
 * The playground header: the data mode, the table theme and light or dark.
 * @param props The current mode, table theme and colour scheme, and their setters.
 * @returns The header.
 */
export function PageHeader({
  mode,
  onMode,
  theme,
  onTheme,
  tableTheme,
  onTableTheme,
}: {
  mode: 'client' | 'server';
  onMode: (mode: 'client' | 'server') => void;
  theme: 'light' | 'dark';
  onTheme: (theme: 'light' | 'dark') => void;
  tableTheme: TableTheme;
  onTableTheme: (theme: TableTheme) => void;
}): ReactElement {
  return (
    <header className="page-header">
      <h1>Tavola</h1>
      <fieldset className="switch">
        <legend className="tv-visually-hidden">Data mode</legend>
        <button type="button" aria-pressed={mode === 'client'} onClick={() => onMode('client')}>
          Client, 500 rows
        </button>
        <button type="button" aria-pressed={mode === 'server'} onClick={() => onMode('server')}>
          Server, 5000 rows
        </button>
      </fieldset>
      <label className="theme-picker">
        Theme
        <select
          value={tableTheme}
          onChange={(event) => onTableTheme(event.target.value as TableTheme)}
        >
          {TABLE_THEMES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>
      <button
        type="button"
        className="theme"
        onClick={() => onTheme(theme === 'light' ? 'dark' : 'light')}
      >
        {theme === 'light' ? 'Dark' : 'Light'} theme
      </button>
    </header>
  );
}
