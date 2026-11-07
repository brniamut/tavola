import type { CSSProperties } from 'react';

import type { TanStackColumn } from '../../table/tanstack.type.ts';
import { cssName } from './css-name.ts';

/**
 * The CSS variables with the sticky offset of every pinned column, set once on the table. Cells
 * read them through `var()`, so resizing a column updates offsets without rerendering the body.
 * @param start The visible columns pinned to the start, in order.
 * @param end The visible columns pinned to the end, in order.
 * @returns The variables, as an inline style.
 */
export function pinOffsetVariables<TRow>(
  start: readonly TanStackColumn<TRow>[],
  end: readonly TanStackColumn<TRow>[],
): CSSProperties {
  const entries = [
    ...start.map((column) => [`--tv-pin-${cssName(column.id)}`, `${column.getStart('start')}px`]),
    ...end.map((column) => [`--tv-pin-${cssName(column.id)}`, `${column.getAfter('end')}px`]),
  ];
  return Object.fromEntries(entries) as CSSProperties;
}
