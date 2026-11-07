import { useMemo } from 'react';

import type { ColumnSpec } from '../columns/column-spec.type.ts';
import type { TanStackColumnDef } from './tanstack.type.ts';
import { toColumnDefs } from './to-column-defs.ts';
import { useLatest } from './use-latest.ts';

/**
 * A string that changes only when something TanStack needs to know about changes: ids, kinds,
 * headers and settings. Renderers and accessors are left out, so inline `defineColumns(...)` in a
 * component body does not rebuild the row model on every render.
 * @param columns The columns.
 * @param selectable Whether the selection column is included.
 * @returns The signature.
 */
function signatureOf<TRow>(columns: readonly ColumnSpec<TRow>[], selectable: boolean): string {
  return JSON.stringify([
    selectable,
    columns.map((column) => [column.id, column.kind, column.header, column.settings]),
  ]);
}

/**
 * Turns the column specs into TanStack definitions that keep their identity as long as the
 * columns are structurally the same.
 * @param columns The columns as the developer passes them, possibly new every render.
 * @param selectable Whether to add the selection column.
 * @returns The definitions, and the latest specs by id for rendering.
 */
export function useColumnDefs<TRow>(
  columns: readonly ColumnSpec<TRow>[],
  selectable: boolean,
): { defs: TanStackColumnDef<TRow>[]; byId: ReadonlyMap<string, ColumnSpec<TRow>> } {
  const byId = useMemo(() => new Map(columns.map((column) => [column.id, column])), [columns]);
  const latest = useLatest(byId);
  const signature = signatureOf(columns, selectable);
  const defs = useMemo(
    () => toColumnDefs(columns, { selectable, read: (id) => latest.current.get(id) }),
    // Rebuilt on structural changes only; the latest renderers are read through `latest`.
    // oxlint-disable-next-line react/exhaustive-deps
    [signature],
  );
  return { defs, byId };
}
