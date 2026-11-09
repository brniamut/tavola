import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { DataTable, type Fetcher, type TableQuery } from '../src/index.ts';
import { columns, users, type User } from './fixtures.ts';

const getRowId = (user: User): string => user.id;

/** The text of the first data cell (name) of every body row. */
function names(): string[] {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => within(row).queryAllByRole('cell')[0]?.textContent ?? '');
}

describe('DataTable in client mode', () => {
  it('renders a row per item and a header per column', () => {
    render(<DataTable label="Users" columns={columns} data={users} getRowId={getRowId} />);
    expect(screen.getByRole('table', { name: 'Users' })).toBeTruthy();
    expect(screen.getAllByRole('columnheader')).toHaveLength(columns.length);
    expect(names()).toEqual(users.map((user) => user.name));
  });

  it('sorts by a column and reports it as aria-sort', async () => {
    render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    await userEvent.click(screen.getByRole('button', { name: 'Logins' }));
    expect(names()).toEqual(['Alan Turing', 'Grace Hopper', 'Edsger Dijkstra', 'Ada Lovelace']);
    expect(screen.getByRole('columnheader', { name: /Logins/ }).getAttribute('aria-sort')).toBe(
      'ascending',
    );
  });

  it('searches across text and enum columns', async () => {
    render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'grace');
    await waitFor(() => expect(names()).toEqual(['Grace Hopper']));
  });

  it('shows "no matches" rather than "no rows" when filters hide everything', async () => {
    render(<DataTable columns={columns} data={users} getRowId={getRowId} />);
    await userEvent.type(screen.getByRole('searchbox', { name: 'Search' }), 'nobody');
    await screen.findByText('No rows match the filters');
  });

  it('starts from a default query with a column filter, and shows it as a chip', () => {
    render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={getRowId}
        defaultQuery={{ filters: { role: ['editor'] } }}
      />,
    );
    expect(names()).toEqual(['Grace Hopper', 'Edsger Dijkstra']);
    expect(screen.getByText('Role: editor')).toBeTruthy();
  });

  it('hides a column from the column picker and remembers it per table id', async () => {
    const { unmount } = render(
      <DataTable id="users" columns={columns} data={users} getRowId={getRowId} />,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Columns' }));
    await userEvent.click(screen.getByRole('button', { name: 'Remove Email' }));
    await userEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.queryByRole('columnheader', { name: /Email/ })).toBeNull();
    unmount();

    render(<DataTable id="users" columns={columns} data={users} getRowId={getRowId} />);
    expect(screen.queryByRole('columnheader', { name: /Email/ })).toBeNull();
  });

  it('passes the selected rows to a bulk action', async () => {
    const onAction = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={getRowId}
        bulkActions={[{ label: 'Archive', onAction }]}
      />,
    );
    const rows = screen.getAllByRole('checkbox', { name: 'Select row' });
    await userEvent.click(rows[0] as HTMLElement);
    await userEvent.click(rows[2] as HTMLElement);
    await userEvent.click(screen.getByRole('button', { name: 'Archive' }));
    const selection = onAction.mock.calls[0]?.[0];
    expect(selection.ids).toEqual(['u1', 'u3']);
    expect(selection.rows.map((user: User) => user.name)).toEqual(['Ada Lovelace', 'Alan Turing']);
  });

  it('calls onRowClick for clicks on the row, not on its checkbox', async () => {
    const onRowClick = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={users}
        getRowId={getRowId}
        selectable
        onRowClick={onRowClick}
      />,
    );
    await userEvent.click(
      screen.getAllByRole('checkbox', { name: 'Select row' })[0] as HTMLElement,
    );
    expect(onRowClick).not.toHaveBeenCalled();
    await userEvent.click(screen.getByText('Grace Hopper'));
    expect(onRowClick).toHaveBeenCalledWith(users[1]);
  });

  it('keeps working when columns are redefined on every render', () => {
    const { rerender } = render(
      <DataTable columns={[...columns]} data={users} getRowId={getRowId} />,
    );
    rerender(<DataTable columns={[...columns]} data={[...users]} getRowId={getRowId} />);
    expect(names()).toHaveLength(users.length);
  });
});

describe('DataTable in server mode', () => {
  it('sends one query object and renders the page it gets back', async () => {
    const fetcher = vi.fn<Fetcher<User>>(async () => ({ rows: users.slice(0, 2), total: 40 }));
    render(
      <DataTable columns={columns} fetcher={fetcher} getRowId={getRowId} pageSizes={[2, 10]} />,
    );
    await waitFor(() => expect(names()).toEqual(['Ada Lovelace', 'Grace Hopper']));
    expect(fetcher.mock.calls[0]?.[0]).toEqual({
      sort: [],
      filters: {},
      search: '',
      page: { index: 0, size: 2 },
    });
    expect(screen.getByText('1-2 of 40')).toBeTruthy();
  });

  it('asks for the next page, and resets to the first page when sorting changes', async () => {
    const queries: TableQuery[] = [];
    const fetcher: Fetcher<User> = async (query) => {
      queries.push(query);
      return { rows: users.slice(0, 2), total: 40 };
    };
    render(<DataTable columns={columns} fetcher={fetcher} getRowId={getRowId} pageSizes={[2]} />);
    await screen.findByText('1-2 of 40');
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() => expect(queries.at(-1)?.page.index).toBe(1));
    await userEvent.click(screen.getByRole('button', { name: 'Name' }));
    await waitFor(() =>
      expect(queries.at(-1)).toMatchObject({
        sort: [{ id: 'name', desc: false }],
        page: { index: 0 },
      }),
    );
  });

  it('pages with cursors when the API returns nextCursor, without needing a total', async () => {
    const queries: TableQuery[] = [];
    const fetcher: Fetcher<User> = async (query) => {
      queries.push(query);
      const index = query.page.index;
      return {
        rows: users.slice(index * 2, index * 2 + 2),
        nextCursor: index === 0 ? 'after-u2' : null,
      };
    };
    render(<DataTable columns={columns} fetcher={fetcher} getRowId={getRowId} pageSizes={[2]} />);
    await screen.findByText('1-2');
    expect(queries[0]?.page).toEqual({ index: 0, size: 2 });

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    await waitFor(() =>
      expect(queries.at(-1)?.page).toEqual({ index: 1, size: 2, cursor: 'after-u2' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Next page' })).toHaveProperty('disabled', true),
    );
    expect(screen.getByText('3-4')).toBeTruthy();

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    await waitFor(() => expect(queries.at(-1)?.page).toEqual({ index: 0, size: 2, cursor: null }));
  });

  it('shows an error with a retry button when the fetch fails', async () => {
    const fetcher = vi
      .fn<Fetcher<User>>()
      .mockRejectedValueOnce(new Error('down'))
      .mockResolvedValue({ rows: users, total: users.length });
    render(<DataTable columns={columns} fetcher={fetcher} getRowId={getRowId} />);
    await userEvent.click(await screen.findByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(names()).toHaveLength(users.length));
  });

  it('offers to select every matching row across pages', async () => {
    const onAction = vi.fn();
    const fetcher: Fetcher<User> = async () => ({ rows: users, total: 400 });
    render(
      <DataTable
        columns={columns}
        fetcher={fetcher}
        getRowId={getRowId}
        bulkActions={[{ label: 'Export', onAction }]}
      />,
    );
    await waitFor(() => expect(names()).toHaveLength(users.length));
    await userEvent.click(screen.getByRole('checkbox', { name: 'Select all rows on this page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Select all 400' }));
    await userEvent.click(screen.getByRole('button', { name: 'Export' }));
    expect(onAction.mock.calls[0]?.[0]).toMatchObject({ allMatching: true });
  });
});
