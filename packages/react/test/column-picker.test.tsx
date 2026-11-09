import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable, defineColumns, type SavedView } from '../src/index.ts';
import { users, type User } from './fixtures.ts';

const getRowId = (user: User): string => user.id;

const columns = defineColumns<User>((col) => [
  col.text('name', { hideable: false, group: 'Person' }),
  col.text('email', { group: 'Contact' }),
  col.enum('role', { options: ['admin', 'editor', 'viewer'], group: 'Access' }),
  col.number('logins', { group: 'Access' }),
  col.text('team', { hidden: true, group: 'Person' }),
]);

/** The header texts, in display order. */
function headers(): string[] {
  return screen.getAllByRole('columnheader').map((header) => header.textContent ?? '');
}

/** The column names listed in the picker, in order. */
function listed(): string[] {
  const list = screen.getByRole('list', { name: 'Columns' });
  return within(list)
    .getAllByRole('checkbox')
    .map((box) => box.closest('label')?.textContent ?? '');
}

/**
 * Opens the column picker.
 * @returns The dialog.
 */
async function openPicker(): Promise<HTMLElement> {
  await userEvent.click(screen.getByRole('button', { name: 'Columns' }));
  return screen.getByRole('dialog', { name: 'Choose columns' });
}

describe('column picker', () => {
  it('lists every column in display order, hidden ones too, with group and state', async () => {
    render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    await openPicker();
    expect(listed()).toEqual(['Name', 'Email', 'Role', 'Logins', 'Team']);
    const name = screen.getByRole('checkbox', { name: 'Name' });
    expect((name as HTMLInputElement).disabled).toBe(true);
    expect(name.getAttribute('aria-describedby')).toBeTruthy();
    expect(screen.getByText('Person · Always shown')).toBeTruthy();
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: 'Team' }).checked).toBe(false);
  });

  it('keeps changes in a draft until Apply, and drops them on Cancel', async () => {
    render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    await openPicker();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Email' }));
    expect(headers()).toContain('Email');
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(headers()).toContain('Email');

    await openPicker();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Email' }));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Team' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(headers()).toEqual(['Name', 'Role', 'Logins', 'Team']);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('moves columns with the arrow buttons and keeps focus on the moved column', async () => {
    render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    await openPicker();
    expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Move up Name' }).disabled).toBe(
      true,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Move up Role' }));
    expect(listed()).toEqual(['Name', 'Role', 'Email', 'Logins', 'Team']);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Move up Role' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(headers()).toEqual(['Name', 'Role', 'Email', 'Logins']);
  });

  it('finds columns by header or group', async () => {
    render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    await openPicker();
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find a column' }), 'access');
    expect(listed()).toEqual(['Role', 'Logins']);
    await userEvent.clear(screen.getByRole('searchbox', { name: 'Find a column' }));
    await userEvent.type(screen.getByRole('searchbox', { name: 'Find a column' }), 'zzz');
    expect(screen.getByText('No columns match')).toBeTruthy();
  });

  it('applies a preset: its columns in its order, the rest hidden except fixed columns', async () => {
    render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={getRowId}
        columnPresets={[{ label: 'Access', columns: ['logins', 'role', 'unknown'] }]}
      />,
    );
    await openPicker();
    await userEvent.click(screen.getByRole('button', { name: 'Access' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(headers()).toEqual(['Logins', 'Role', 'Name']);

    await openPicker();
    await userEvent.click(screen.getByRole('button', { name: 'All columns' }));
    await userEvent.click(screen.getByRole('button', { name: 'Restore defaults' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(headers()).toEqual(['Name', 'Email', 'Role', 'Logins']);
  });

  it('saves a view with its columns, filters, sort and search, and loads it again', async () => {
    const onViewsChange = vi.fn();
    render(
      <DataTable
        id="views"
        columns={columns}
        data={users}
        getRowId={getRowId}
        onViewsChange={onViewsChange}
      />,
    );
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'ada');
    // The search box is debounced: wait until the rows are filtered.
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(2));
    await openPicker();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Email' }));
    await userEvent.type(screen.getByRole('textbox', { name: 'Save as view' }), 'Lean');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    const [saved] = (onViewsChange.mock.calls[0]?.[0] ?? []) as SavedView[];
    expect(saved?.name).toBe('Lean');
    expect(saved?.query.search).toBe('ada');
    expect(saved?.layout.visibility).toEqual({ email: false, team: false });

    await userEvent.clear(screen.getByRole('searchbox', { name: 'Search' }));
    await waitFor(() => expect(screen.getAllByRole('row')).toHaveLength(users.length + 1));
    await openPicker();
    await userEvent.click(screen.getByRole('checkbox', { name: 'Email' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(headers()).toContain('Email');

    await openPicker();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Saved views' }), 'Lean');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(headers()).not.toContain('Email');
    expect(screen.getByRole<HTMLInputElement>('searchbox', { name: 'Search' }).value).toBe('ada');
  });

  it('overwrites a view with the same name regardless of case, and deletes views', async () => {
    const views: SavedView[] = [
      {
        name: 'Lean',
        layout: { order: [], visibility: {}, pinning: { start: [], end: [] }, sizing: {} },
        query: { sort: [], filters: {}, search: '' },
      },
    ];
    const onViewsChange = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={getRowId}
        views={views}
        onViewsChange={onViewsChange}
      />,
    );
    await openPicker();
    await userEvent.type(screen.getByRole('textbox', { name: 'Save as view' }), 'LEAN');
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    const saved = (onViewsChange.mock.calls[0]?.[0] ?? []) as SavedView[];
    expect(saved.map((view) => view.name)).toEqual(['LEAN']);

    await openPicker();
    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Saved views' }), 'Lean');
    await userEvent.click(screen.getByRole('button', { name: 'Delete view' }));
    expect(onViewsChange.mock.calls[1]?.[0]).toEqual([]);
  });

  it('hides the save fields when views cannot be kept', async () => {
    render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    await openPicker();
    expect(screen.queryByRole('textbox', { name: 'Save as view' })).toBeNull();
  });

  it('shows how many columns are visible while some are hidden, and opens the picker', async () => {
    const { rerender } = render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    expect(screen.getByText('4 of 5 columns visible')).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Choose columns' }));
    expect(screen.getByRole('dialog', { name: 'Choose columns' })).toBeTruthy();
    await userEvent.click(screen.getByRole('button', { name: 'Close' }));
    rerender(
      <DataTable columns={columns} data={users} getRowId={getRowId} columnSummary={false} />,
    );
    expect(screen.queryByText('4 of 5 columns visible')).toBeNull();
  });
});
