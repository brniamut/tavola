---
title: defineColumns
description: The column builder and every column option.
sidebar:
  order: 2
---

```ts
import { defineColumns } from '@tavola/react';

const columns = defineColumns<Row>((col) => [/* columns */]);
```

`defineColumns` throws when two columns share an id, so the mistake shows up at once.

## Builder methods

| Method                              | Keys                        | Notes                                                           |
| ----------------------------------- | --------------------------- | --------------------------------------------------------------- |
| `col.text(key, options?)`           | string fields               |                                                                 |
| `col.number(key, options?)`         | number fields               | Right-aligned by default.                                       |
| `col.date(key, options?)`           | `Date` or ISO string fields |                                                                 |
| `col.enum(key, options)`            | any field                   | `options.options` lists the values, bare or `{ value, label }`. |
| `col.boolean(key, options?)`        | boolean fields              |                                                                 |
| `col.display(id, options)`          | none                        | `options.cell(row)` renders the cell.                           |
| `col.actions(getActions, options?)` | none                        | `getActions(row)` returns `RowAction[]`. Pinned to the end.     |

## Options

| Option        | Type                                     | Kinds        | Default                      |
| ------------- | ---------------------------------------- | ------------ | ---------------------------- |
| `header`      | `string`                                 | all          | The key in words.            |
| `size`        | `number`                                 | all          | 160                          |
| `minSize`     | `number`                                 | all          | 64                           |
| `maxSize`     | `number`                                 | all          | none                         |
| `pin`         | `'start' \| 'end'`                       | all          | none                         |
| `hidden`      | `boolean`                                | all          | `false`                      |
| `priority`    | `number`                                 | all          | none                         |
| `group`       | `string`                                 | all          | none                         |
| `align`       | `'start' \| 'center' \| 'end'`           | all          | `end` for numbers            |
| `className`   | `string \| (row) => string \| undefined` | all          | none                         |
| `hideable`    | `boolean`                                | all          | `true` (`false` for actions) |
| `reorderable` | `boolean`                                | all          | `true` (`false` for actions) |
| `resizable`   | `boolean`                                | all          | `true` (`false` for actions) |
| `cell`        | `({ value, row }) => ReactNode`          | data columns | Formatted by kind.           |
| `sortable`    | `boolean`                                | data columns | `true`                       |
| `filterable`  | `boolean`                                | data columns | `true`                       |
| `searchable`  | `boolean`                                | data columns | `true` for text and enum     |

## RowAction

| Field      | Type         | Purpose                     |
| ---------- | ------------ | --------------------------- |
| `label`    | `string`     | Menu text.                  |
| `onSelect` | `() => void` | Runs when picked.           |
| `danger`   | `boolean`    | Shown in the danger colour. |
| `disabled` | `boolean`    | Shown but not selectable.   |
