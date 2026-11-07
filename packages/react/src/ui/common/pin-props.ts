import type { CSSProperties } from 'react';

import type { TanStackColumn } from '../../table/tanstack.type.ts';
import { cssName } from './css-name.ts';

/**
 * The inline style and data attributes of a header or body cell for its pin state.
 * @param column The cell's column.
 * @param edge Whether this is the last start-pinned or first end-pinned column, which casts a
 *   shadow over the scrolled content.
 * @returns Props to spread on the cell.
 */
export function pinProps<TRow>(
  column: TanStackColumn<TRow>,
  edge: boolean,
): { style?: CSSProperties; 'data-pinned'?: 'start' | 'end'; 'data-pin-edge'?: true } {
  const pinned = column.getIsPinned();
  if (!pinned) return {};
  const offset = `var(--tv-pin-${cssName(column.id)})`;
  return {
    style: pinned === 'start' ? { insetInlineStart: offset } : { insetInlineEnd: offset },
    'data-pinned': pinned,
    ...(edge && { 'data-pin-edge': true as const }),
  };
}
