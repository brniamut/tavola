import type { ReactElement } from 'react';

import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { Locale } from '../../locale/locale.type.ts';
import type { TanStackColumn } from '../../table/tanstack.type.ts';
import { FilterEditor } from '../filters/filter-editor.tsx';

/**
 * Value counts of an enum column, for its filter. Only in client mode: in server mode the table
 * sees one page, and counts of one page would mislead.
 * @param column The column.
 * @param serverMode Whether the server filters.
 * @returns The counts, or undefined.
 */
function countsFor<TRow>(
  column: TanStackColumn<TRow>,
  serverMode: boolean,
): ReadonlyMap<unknown, number> | undefined {
  return serverMode ? undefined : column.getFacetedUniqueValues();
}

/**
 * The actions the menu offers for a column in its current state.
 * @param column The column.
 * @param locale Texts.
 * @returns Label and action per menu item.
 */
function menuItems<TRow>(
  column: TanStackColumn<TRow>,
  locale: Locale,
): { label: string; action: () => void }[] {
  const sorted = column.getIsSorted();
  const pinned = column.getIsPinned();
  const canSort = column.getCanSort();
  const candidates = [
    canSort &&
      sorted !== 'asc' && {
        label: locale.sortAscending,
        action: () => column.toggleSorting(false),
      },
    canSort &&
      sorted !== 'desc' && {
        label: locale.sortDescending,
        action: () => column.toggleSorting(true),
      },
    sorted && { label: locale.clearSort, action: () => column.clearSorting() },
    pinned !== 'start' && { label: locale.pinStart, action: () => column.pin('start') },
    pinned !== 'end' && { label: locale.pinEnd, action: () => column.pin('end') },
    pinned && { label: locale.unpin, action: () => column.pin(false) },
    column.getCanHide() && {
      label: locale.hideColumn,
      action: () => column.toggleVisibility(false),
    },
  ];
  return candidates.filter((item) => item !== false);
}

/**
 * The menu behind a header's options button: sort, pin, hide and filter.
 * @param props The column, its spec, texts and a function to close the menu.
 * @returns The menu content.
 */
export function HeaderMenu<TRow>({
  column,
  spec,
  locale,
  serverMode,
  close,
}: {
  column: TanStackColumn<TRow>;
  spec: ColumnSpec<TRow>;
  locale: Locale;
  serverMode: boolean;
  close: () => void;
}): ReactElement {
  const run = (action: () => void) => () => {
    action();
    close();
  };
  const items = menuItems(column, locale);
  return (
    <div className="tv-menu">
      {items.map((item) => (
        <button key={item.label} type="button" className="tv-menu-item" onClick={run(item.action)}>
          {item.label}
        </button>
      ))}
      {column.getCanFilter() && (
        <div className="tv-menu-section">
          <p className="tv-menu-heading">{locale.filter}</p>
          <FilterEditor
            spec={spec as ColumnSpec<unknown>}
            locale={locale}
            value={column.getFilterValue()}
            onChange={(value) => column.setFilterValue(value)}
            counts={countsFor(column, serverMode)}
          />
        </div>
      )}
    </div>
  );
}
