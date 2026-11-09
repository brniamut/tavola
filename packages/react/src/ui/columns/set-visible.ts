import { ACTIONS_COLUMN_ID } from '../../columns/column-sizes.ts';
import type { ViewLayout } from '../../views/saved-view.type.ts';

/**
 * Moves an id to the end of a list, before the actions column when that is there.
 * @param ids The list.
 * @param id The id to move.
 * @returns The new list.
 */
function toEnd(ids: readonly string[], id: string): string[] {
  const rest = ids.filter((current) => current !== id);
  const actions = rest.indexOf(ACTIONS_COLUMN_ID);
  if (actions === -1) return [...rest, id];
  return [...rest.slice(0, actions), id, ...rest.slice(actions)];
}

/**
 * Shows or hides a column in the draft. A column that is shown again goes to the end of its
 * region, as if it were added to the list.
 * @param layout The draft columns.
 * @param id The column.
 * @param visible Whether to show it.
 * @returns The new draft columns.
 */
export function setVisible(layout: ViewLayout, id: string, visible: boolean): ViewLayout {
  const others = Object.entries(layout.visibility).filter(([key]) => key !== id);
  if (!visible) return { ...layout, visibility: Object.fromEntries([...others, [id, false]]) };
  const { start, end } = layout.pinning;
  return {
    ...layout,
    visibility: Object.fromEntries(others),
    order: toEnd(layout.order, id),
    pinning: {
      start: start.includes(id) ? toEnd(start, id) : start,
      end: end.includes(id) ? toEnd(end, id) : end,
    },
  };
}
