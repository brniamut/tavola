import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { useId, useRef, type ReactElement } from 'react';

import { moveColumn } from '../../layout/move-column.ts';
import type { ViewLayout } from '../../views/saved-view.type.ts';
import { useModel } from '../common/model-context.ts';
import type { ColumnListRow } from './column-draft.type.ts';
import { listRows } from './list-rows.ts';
import { markDragging } from './mark-dragging.ts';
import { ShownRow } from './shown-row.tsx';

/**
 * The left pane: the shown columns in table order. Drag a handle or use the arrows to reorder,
 * and the cross to hide a column, which moves it to the "Add columns" pane.
 * @param props The draft columns, what to do with a change, and a function that moves focus.
 * @returns The pane.
 */
export function ShownPane({
  layout,
  onChange,
  focusLater,
}: {
  layout: ViewLayout;
  onChange: (layout: ViewLayout) => void;
  focusLater: (...keys: string[]) => void;
}): ReactElement {
  const { specs, locale } = useModel();
  const headingId = useId();
  const sectionRef = useRef<HTMLElement>(null);
  const rows = listRows(layout, specs);
  const move = (row: ColumnListRow, step: -1 | 1): void => {
    const change = { visible: row.movable, from: row.index, to: row.index + step };
    onChange(moveColumn(layout, row.region, change));
    // At the end of its region the arrow just used is disabled; then the other one takes focus.
    const [used, other] = step < 0 ? ['up', 'down'] : ['down', 'up'];
    focusLater(`${used}:${row.id}`, `${other}:${row.id}`);
  };
  const remove = (id: string): void => {
    onChange({ ...layout, visibility: { ...layout.visibility, [id]: false } });
    focusLater(`add:${id}`);
  };
  return (
    <section ref={sectionRef} className="tv-pane" aria-labelledby={headingId}>
      <h3 id={headingId} className="tv-pane-heading">
        {locale.shownColumns(rows.length)}
      </h3>
      <DragDropProvider
        onBeforeDragStart={() => markDragging(sectionRef.current, true)}
        onDragEnd={(event) => {
          markDragging(sectionRef.current, false);
          const { source } = event.operation;
          if (event.canceled || !isSortable(source)) return;
          const row = rows.find((candidate) => candidate.id === String(source.id));
          if (!row) return;
          const change = { visible: row.movable, from: source.initialIndex, to: source.index };
          onChange(moveColumn(layout, row.region, change));
        }}
      >
        <ul className="tv-shown-list" aria-labelledby={headingId}>
          {rows.map((row) => (
            <ShownRow key={row.id} row={row} onMove={move} onRemove={remove} />
          ))}
        </ul>
      </DragDropProvider>
    </section>
  );
}
