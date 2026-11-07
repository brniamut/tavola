---
title: DataTable
description: Every prop of the DataTable component.
sidebar:
  order: 1
---

```tsx
import { DataTable } from '@tavola/react';
```

| Prop                | Type                                                  | Purpose                                                               |
| ------------------- | ----------------------------------------------------- | --------------------------------------------------------------------- |
| `columns`           | `ColumnSpec<Row>[]`                                   | From `defineColumns`. **Required.**                                   |
| `getRowId`          | `(row) => string`                                     | A stable id per row, never the index. **Required.**                   |
| `data`              | `Row[]`                                               | All rows; the table sorts, filters and pages them.                    |
| `fetcher`           | `Fetcher<Row>`                                        | Fetches a page per query; takes precedence over `data`.               |
| `id`                | `string`                                              | Remember the layout in `localStorage` under this id.                  |
| `label`             | `string`                                              | Accessible name of the table.                                         |
| `bulkActions`       | `BulkAction<Row>[]`                                   | Buttons for selected rows; turns on selection.                        |
| `selectable`        | `boolean`                                             | Selection without bulk actions.                                       |
| `onSelectionChange` | `(selection) => void`                                 | Reports the selection.                                                |
| `query`             | `TableQuery`                                          | Controls the query; pass with `onQueryChange`.                        |
| `onQueryChange`     | `(query) => void`                                     | Reports every query change.                                           |
| `defaultQuery`      | `Partial<TableQuery>`                                 | Initial sort, filters, search or page.                                |
| `pageSizes`         | `number[]`                                            | Page size choices; the first is the default. Default `[25, 50, 100]`. |
| `defaultDensity`    | `'compact' \| 'normal' \| 'comfortable'`              | Initial row density.                                                  |
| `onRowClick`        | `(row) => void`                                       | Row clicks, ignoring clicks on controls inside the row.               |
| `loading`           | `boolean`                                             | Client mode: show the loading state while you fetch all rows.         |
| `error`             | `unknown`                                             | Client mode: show the error state.                                    |
| `toolbar`           | `ReactNode`                                           | Content at the end of the toolbar, such as an "Add" button.           |
| `empty`             | `ReactNode`                                           | Replaces the text shown when there are no rows at all.                |
| `locale`            | `Partial<Locale>`                                     | Texts and the language for numbers and dates.                         |
| `theme`             | `'cotto' \| 'ink' \| 'basil' \| 'harbor' \| 'ledger'` | A built-in look. Default `cotto`.                                     |
| `classNames`        | `Partial<Record<TablePart, string>>`                  | Extra classes per part.                                               |
| `tableRef`          | `{ current: TanStackTable<Row> \| null }`             | Receives the TanStack table instance.                                 |

## BulkAction

| Field      | Type                                                   | Purpose                                                                  |
| ---------- | ------------------------------------------------------ | ------------------------------------------------------------------------ |
| `label`    | `string`                                               | Button text.                                                             |
| `onAction` | `(selection: Selection<Row>) => void \| Promise<void>` | Runs with the selection; the bar is disabled while a promise is pending. |
| `danger`   | `boolean`                                              | Shown in the danger colour.                                              |

## The escape hatch

`tableRef` receives the underlying TanStack Table v9 instance, for anything the props do not cover. Tavola owns all table state, so read from the instance freely, but prefer the props for changes so the saved layout and the query stay in sync.
