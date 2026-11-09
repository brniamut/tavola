import { useRef, useState, type ReactElement } from 'react';

import { moveColumn } from '../../layout/move-column.ts';
import { useIsomorphicLayoutEffect } from '../../table/use-isomorphic-layout-effect.ts';
import type { ViewLayout } from '../../views/saved-view.type.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import type { ColumnListRow } from './column-draft.type.ts';
import { ColumnRow } from './column-row.tsx';
import { listRows } from './list-rows.ts';

/**
 * Puts focus back on a moved column's arrow, or its other arrow when it reached the end. React
 * moves list items in the DOM, which can drop focus.
 * @param list The list element.
 * @param target The moved column and the arrow that was used.
 */
function refocus(list: HTMLElement | null, target: { id: string; dir: 'up' | 'down' }): void {
  const row = [...(list?.querySelectorAll<HTMLElement>('[data-column-id]') ?? [])].find(
    (item) => item.dataset['columnId'] === target.id,
  );
  const button =
    row?.querySelector<HTMLElement>(`button[data-dir="${target.dir}"]:not(:disabled)`) ??
    row?.querySelector<HTMLElement>('button:not(:disabled)');
  button?.focus();
}

/**
 * Shows or hides a column in the draft.
 * @param layout The draft columns.
 * @param id The column to toggle.
 * @returns The new draft columns.
 */
function toggle(layout: ViewLayout, id: string): ViewLayout {
  const hidden = layout.visibility[id] === false;
  const others = Object.entries(layout.visibility).filter(([key]) => key !== id);
  return { ...layout, visibility: Object.fromEntries(hidden ? others : [...others, [id, false]]) };
}

/**
 * The searchable list of columns in the column picker, with a checkbox and arrows per column.
 * @param props The draft columns and a function that receives changes.
 * @returns The search box and the list.
 */
export function ColumnList({
  layout,
  onChange,
}: {
  layout: ViewLayout;
  onChange: (layout: ViewLayout) => void;
}): ReactElement {
  const { specs, locale } = useModel();
  const [search, setSearch] = useState('');
  const [moved, setMoved] = useState<{ id: string; dir: 'up' | 'down' } | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  useIsomorphicLayoutEffect(() => {
    if (moved) refocus(listRef.current, moved);
  }, [moved]);

  const rows = listRows(layout, specs, search);
  const move = (row: ColumnListRow, step: -1 | 1): void => {
    const change = { visible: row.movable, from: row.index, to: row.index + step };
    onChange(moveColumn(layout, row.region, change));
    setMoved({ id: row.id, dir: step < 0 ? 'up' : 'down' });
  };
  return (
    <>
      <label className="tv-search tv-column-search">
        <Icon name="search" />
        <input
          type="search"
          className="tv-search-input"
          placeholder={locale.findColumn}
          aria-label={locale.findColumn}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
        />
      </label>
      <ul ref={listRef} className="tv-column-list" aria-label={locale.columns}>
        {rows.map((row) => (
          <ColumnRow
            key={row.id}
            row={row}
            visible={layout.visibility[row.id] !== false}
            onToggle={(id) => onChange(toggle(layout, id))}
            onMove={move}
          />
        ))}
        {rows.length === 0 && <li className="tv-column-empty">{locale.noColumnsFound}</li>}
      </ul>
    </>
  );
}
