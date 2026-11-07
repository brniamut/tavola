<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/brniamut/tavola/main/brand/logo-dark.svg">
    <img src="https://raw.githubusercontent.com/brniamut/tavola/main/brand/logo.svg" alt="" width="64" height="64">
  </picture>
</p>

# Tavola

An admin data table for React. Search, typed column filters, multi-column sort, a column picker, drag-to-reorder, resizing, pinning, row selection with bulk actions, pagination and a remembered layout. Works with rows in memory or with your API, through one query object.

Built on [TanStack Table v9](https://tanstack.com/table) and [dnd-kit](https://dndkit.com). MIT licensed, including every feature listed here.

```sh
pnpm add @tavola/react
```

## Quick start

```tsx
import { DataTable, defineColumns } from '@tavola/react';
import '@tavola/react/styles.css';

interface User {
  id: string;
  name: string;
  role: 'admin' | 'editor' | 'viewer';
  logins: number;
  createdAt: string;
}

const columns = defineColumns<User>((col) => [
  col.text('name', { pin: 'start' }),
  col.enum('role', { options: ['admin', 'editor', 'viewer'] }),
  col.number('logins'),
  col.date('createdAt', { header: 'Created' }),
  col.actions((user) => [{ label: 'Edit', onSelect: () => edit(user) }]),
]);

export function Users({ users }: { users: User[] }) {
  return (
    <DataTable
      id="users"
      label="Users"
      columns={columns}
      data={users}
      getRowId={(user) => user.id}
    />
  );
}
```

That is a complete table: search, a filter per column, sorting (Shift-click for more than one column), a column picker, drag handles, resize grips, pinning, pagination, and a layout that is remembered under the id `users`.

## Columns

`defineColumns<Row>` hands you a builder with one method per kind of data. The kind decides the filter, the sorting and the formatting, and TypeScript only accepts keys whose value fits:

| Method                       | Accepts keys holding | Filter                  |
| ---------------------------- | -------------------- | ----------------------- |
| `col.text(key)`              | `string`             | Contains, ignoring case |
| `col.number(key)`            | `number`             | Min and max             |
| `col.date(key)`              | `Date` or ISO string | From and to             |
| `col.enum(key, { options })` | any                  | Checkboxes, with counts |
| `col.boolean(key)`           | `boolean`            | Any, yes, no            |
| `col.display(id, { cell })`  | (no key)             | None                    |
| `col.actions(getActions)`    | (no key)             | None; pinned to the end |

```ts
col.number('name'); // Type error: name is not a number
col.enum('role', { options: ['owner'] }); // Type error: 'owner' is not a role
```

Every column takes `header`, `size`, `minSize`, `maxSize`, `pin`, `hidden`, `align`, `className`, `priority`, and `hideable`, `reorderable`, `resizable`. Data columns also take `cell`, `sortable`, `filterable` and `searchable`. A custom `cell` receives the typed value and the row:

```tsx
col.number('storageMb', { header: 'Storage', cell: ({ value }) => `${value} MB` });
```

On narrow screens, columns with a `priority` hide automatically, highest number first, until the rest fits. Columns without one never hide by themselves, and the user can show a hidden column again from the column picker.

Define columns at module level or in `useMemo`. The table also copes with a new array on every render, but defining them once lets rows skip rerendering.

## Server mode

Pass `fetcher` instead of `data`. The table sends one plain query object and shows what comes back:

```tsx
<DataTable
  columns={columns}
  getRowId={(user) => user.id}
  fetcher={async (query, { signal }) => {
    const response = await fetch(`/api/users?${toSearchParams(query)}`, { signal });
    return response.json(); // { rows: User[], total: number }
  }}
/>
```

```ts
interface TableQuery {
  sort: { id: string; desc: boolean }[];
  filters: Record<string, FilterValue>; // per column; see the filter types
  search: string;
  page: { index: number; size: number };
}
```

The table takes care of the wiring that usually goes wrong: requests are debounced while typing, a stale request is aborted, a late answer to an old query is ignored, the page goes back to the first page when sort, filters or search change, the current rows stay visible while the next page loads, and a failed request shows an error with a retry button.

Filter values per kind: text `string`, number `{ min?, max? }`, date `{ from?, to? }` as `YYYY-MM-DD`, enum an array of values, boolean `boolean`.

### Cursor pagination

If your API pages with a cursor, return `{ rows, nextCursor }` (and `total` when you know it). The table sends the cursor back as `query.page.cursor` for the next page, keeps the cursors of earlier pages for going back, and starts over when sort, filters or search change. Without a total, the footer shows `1-25` and "select all matching" works without a count.

## Controlling the query

Every query change is reported. To keep it in the URL or your own store, control it:

```tsx
<DataTable query={query} onQueryChange={setQuery} /* ... */ />
```

`onQueryChange` on its own reports changes and leaves the query to the table, so a table never freezes because only half of a controlled pair was passed. Use `defaultQuery` to start with a sort or filter.

### In the URL

`useUrlQuery` keeps the query in the address bar, so a filtered view can be bookmarked and shared and the back button restores it. No router needed:

```tsx
<DataTable {...useUrlQuery()} columns={columns} fetcher={fetchUsers} getRowId={(u) => u.id} />
```

The URL stays readable: `?sort=name,-logins&q=ada&page=2&size=50&filter={...}`, with defaults left out. For two tables on one page, give each a `prefix` (`useUrlQuery({ prefix: 'users.' })`). With a router that owns the URL, use the pure helpers with its navigation:

```ts
const query = searchParamsToQuery(searchParams);
router.replace(`?${queryToSearchParams(nextQuery, {}, searchParams)}`);
```

### With TanStack Query

`queryClientFetcher` puts pages in your TanStack Query cache: going back to a page is instant, equal queries are fetched once, and invalidating the base key after a mutation refreshes the table. Tavola does not depend on TanStack Query.

```tsx
const queryClient = useQueryClient();
const fetcher = useMemo(
  () =>
    queryClientFetcher(queryClient, {
      queryKey: ['users'],
      queryFn: api.listUsers,
      staleTime: 30_000,
    }),
  [queryClient],
);
```

## Selection and bulk actions

Giving `bulkActions` turns on row selection:

```tsx
<DataTable
  bulkActions={[
    { label: 'Export', onAction: (selection) => exportRows(selection.ids) },
    {
      label: 'Delete',
      danger: true,
      onAction: async (selection) => {
        await deleteUsers(
          selection.allMatching ? { query: selection.query } : { ids: selection.ids },
        );
        selection.clear();
      },
    },
  ]}
  /* ... */
/>
```

Selection is keyed by `getRowId`, so it survives sorting and paging. Shift-click selects a range. The header checkbox selects the page; the bar then offers to select every matching row. In server mode that sets `selection.allMatching`, and your action applies to everything matching `selection.query`. While a returned promise is pending, the bar is disabled.

## Layout and persistence

With an `id`, the column order, visibility, pinning, widths, density and page size are saved in localStorage. The saved layout is read after mount, so server rendering is not affected, and it is checked against the current columns: removed columns are dropped, new columns appear in their default place, widths are clamped. Changing your columns never breaks a user's saved layout. The column picker has a "Reset layout" button.

## Styling

Five built-in looks: `cotto` (the default: warm paper and ink with a terracotta accent), `ink`, `basil`, `harbor` and `ledger`. Pick one with `<DataTable theme="ink" />`.

The stylesheet is plain CSS in the cascade layer `tavola`. Your own classes, Tailwind utilities included, override it without `!important` or specificity tricks.

Theme with CSS variables on `.tv-root` or any ancestor:

```css
.tv-root {
  --tv-accent: #0f766e;
  --tv-radius: 4px;
  --tv-row-height: 36px;
}
```

Dark mode follows the page's `color-scheme`: set `color-scheme: light dark` on the page to follow the system, or `color-scheme: dark` to force it.

State is exposed as data attributes for your own selectors: `[data-sorted]`, `[data-filtered]`, `[data-selected]`, `[data-pinned]`, `[data-density]`, `[data-loading]`, `[data-dragging]`.

Add classes per part with `classNames` (`root`, `toolbar`, `scroller`, `table`, `headerRow`, `headerCell`, `row`, `cell`, `footer`), or per column with the column's `className`, which can be a function of the row.

## Texts

All texts are in one object. Pass the ones you want to change, or all of them to translate:

```tsx
<DataTable locale={{ search: 'Zoeken', columns: 'Kolommen', language: 'nl-NL' }} /* ... */ />
```

`language` also sets how numbers and dates are formatted.

## Accessibility

A real `<table>` with `aria-sort` on sorted headers, labelled checkboxes, menus and controls. Columns can be moved with the keyboard (focus the drag handle, Space, arrow keys, Space) and resized with the arrow keys on the resize handle. The selection count and page range are announced.

## Escape hatch

`tableRef` receives the TanStack table instance, for anything this API does not cover:

```tsx
const tableRef = useRef<TanStackTable<User>>(null);
<DataTable tableRef={tableRef} /* ... */ />;
```

## Props

| Prop                | Purpose                                                           |
| ------------------- | ----------------------------------------------------------------- |
| `columns`           | From `defineColumns`. Required.                                   |
| `getRowId`          | A stable id per row, never the index. Required.                   |
| `data` / `fetcher`  | Client mode or server mode. One of them.                          |
| `id`                | Remember the layout under this id.                                |
| `label`             | Accessible name of the table.                                     |
| `bulkActions`       | Buttons for selected rows; turns on selection.                    |
| `selectable`        | Selection without bulk actions.                                   |
| `onSelectionChange` | Reports the selection.                                            |
| `query`             | Controlled query, with `onQueryChange`.                           |
| `onQueryChange`     | Reports every query change.                                       |
| `defaultQuery`      | Initial sort, filters, search or page.                            |
| `pageSizes`         | Page size choices; the first is the default. Default 25, 50, 100. |
| `defaultDensity`    | `compact`, `normal` or `comfortable`.                             |
| `onRowClick`        | Row click, ignoring clicks on controls inside the row.            |
| `loading` / `error` | Client mode: show the loading or error state.                     |
| `toolbar`           | Content at the end of the toolbar.                                |
| `empty`             | Replaces the "no rows" text.                                      |
| `locale`            | Texts and language.                                               |
| `classNames`        | Classes per part.                                                 |
| `tableRef`          | The TanStack table instance.                                      |

## Status

Version 0, before a first release. The API may still change.
