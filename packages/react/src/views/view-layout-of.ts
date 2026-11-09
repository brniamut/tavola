import type { TableLayout } from '../layout/layout.type.ts';
import type { ViewLayout } from './saved-view.type.ts';

/**
 * The part of a layout that a view keeps: the columns, without density and page size.
 * @param layout A full layout.
 * @returns Order, visibility, pins and widths.
 */
export function viewLayoutOf(layout: ViewLayout | TableLayout): ViewLayout {
  const { order, visibility, pinning, sizing } = layout;
  return { order, visibility, pinning, sizing };
}
