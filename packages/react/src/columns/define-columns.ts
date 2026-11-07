import type { ColumnBuilder } from './column-builder.type.ts';
import type { ColumnSpec } from './column-spec.type.ts';
import { createColumnBuilder } from './create-column-builder.ts';

/**
 * Defines the columns of a table. Call it at module level or in `useMemo`; the table also copes
 * with a new array every render, but defining columns once is cheaper.
 *
 * @example
 * const columns = defineColumns<User>((col) => [
 *   col.text('name', { pin: 'start' }),
 *   col.enum('role', { options: ['admin', 'editor', 'viewer'] }),
 *   col.date('createdAt', { header: 'Created' }),
 *   col.actions((user) => [{ label: 'Edit', onSelect: () => edit(user) }]),
 * ]);
 * @param build Receives the column builder and returns the columns in their default order.
 * @returns The columns, ready for `<DataTable columns={...}>`.
 */
export function defineColumns<TRow>(
  build: (col: ColumnBuilder<TRow>) => ColumnSpec<TRow>[],
): ColumnSpec<TRow>[] {
  const columns = build(createColumnBuilder<TRow>());
  const seen = new Set<string>();
  for (const column of columns) {
    if (seen.has(column.id))
      throw new Error(
        `Tavola: two columns have the id "${column.id}". Give display columns a unique id.`,
      );
    seen.add(column.id);
  }
  return columns;
}
