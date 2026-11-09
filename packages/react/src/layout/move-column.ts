import type { TableLayout } from './layout.type.ts';

/**
 * Moves one id within a list of visible ids, then writes the new order back into a full list
 * that may also hold hidden or pinned ids, which keep their places.
 * @param full The complete list.
 * @param visible The ids the user sees, in their current order.
 * @param move The index to move from and to, within `visible`.
 * @returns The full list in its new order.
 */
function reorder(
  full: readonly string[],
  visible: readonly string[],
  move: { from: number; to: number },
): string[] {
  const moved = [...visible];
  const [id] = moved.splice(move.from, 1);
  if (id === undefined) return [...full];
  moved.splice(move.to, 0, id);
  const slots = new Set(visible);
  let next = 0;
  return full.map((current) => (slots.has(current) ? (moved[next++] ?? current) : current));
}

/**
 * Applies a column drag to the layout. Columns move only within their region: pinned to the
 * start, unpinned, or pinned to the end.
 * @param layout The current layout.
 * @param region The region the column was dragged in.
 * @param move The ids visible in that region, and the indexes to move from and to.
 * @returns The new layout, or the same layout when nothing moved.
 */
export function moveColumn<TLayout extends Pick<TableLayout, 'order' | 'pinning'>>(
  layout: TLayout,
  region: 'start' | 'center' | 'end',
  move: { visible: readonly string[]; from: number; to: number },
): TLayout {
  if (move.from === move.to) return layout;
  if (region === 'center') return { ...layout, order: reorder(layout.order, move.visible, move) };
  return {
    ...layout,
    pinning: { ...layout.pinning, [region]: reorder(layout.pinning[region], move.visible, move) },
  };
}
