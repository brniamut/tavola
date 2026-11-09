import { useSortable } from '@dnd-kit/react/sortable';
import { useId, type ReactElement } from 'react';

import type { TavolaModel } from '../../table/tavola-model.type.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import type { ColumnListRow } from './column-draft.type.ts';
import { markDragging } from './mark-dragging.ts';

/**
 * Whether a shown column is hidden anyway, because the table is too narrow for it.
 * @param model The table model.
 * @param id The column id.
 * @returns True when the priority rules hide it.
 */
function isSqueezed(model: TavolaModel<unknown>, id: string): boolean {
  return model.layout.visibility[id] !== false && !model.table.getColumn(id)?.getIsVisible();
}

/**
 * The small print under a column's name: its group, and why it behaves differently.
 * @param model The table model.
 * @param row The listed column.
 * @returns The texts that apply, joined; empty when none do.
 */
function metaText(model: TavolaModel<unknown>, row: ColumnListRow): string {
  const { specs, locale } = model;
  const settings = specs.get(row.id)?.settings;
  const parts = [
    settings?.group,
    settings?.hideable === false && locale.alwaysShown,
    row.region === 'start' && locale.pinnedStart,
    row.region === 'end' && locale.pinnedEnd,
    isSqueezed(model, row.id) && locale.hiddenForSpace,
  ];
  return parts.filter(Boolean).join(' · ');
}

/**
 * The up and down arrows of a column, which move it among the columns of its region that can
 * move, and the cross that hides it.
 * @param props The row, the header for the labels, and what to do on a move or a remove.
 * @returns The buttons.
 */
function RowButtons({
  row,
  header,
  onMove,
  onRemove,
}: {
  row: ColumnListRow;
  header: string;
  onMove: (row: ColumnListRow, step: -1 | 1) => void;
  onRemove: (id: string) => void;
}): ReactElement {
  const { locale, specs } = useModel();
  return (
    <span className="tv-column-moves">
      <button
        type="button"
        className="tv-icon-button"
        data-focus-key={`up:${row.id}`}
        aria-label={`${locale.moveUp} ${header}`}
        disabled={row.index <= 0}
        onClick={() => onMove(row, -1)}
      >
        <Icon name="chevronUp" />
      </button>
      <button
        type="button"
        className="tv-icon-button"
        data-focus-key={`down:${row.id}`}
        aria-label={`${locale.moveDown} ${header}`}
        disabled={row.index === -1 || row.index === row.movable.length - 1}
        onClick={() => onMove(row, 1)}
      >
        <Icon name="chevronDown" />
      </button>
      <button
        type="button"
        className="tv-icon-button"
        data-focus-key={`remove:${row.id}`}
        aria-label={`${locale.removeColumn} ${header}`}
        disabled={specs.get(row.id)?.settings.hideable === false}
        onClick={() => onRemove(row.id)}
      >
        <Icon name="close" />
      </button>
    </span>
  );
}

/**
 * A shown column: a drag handle (pointer, or Space and the arrow keys), its name and small print,
 * arrows, and a button that hides it.
 * @param props The row, and what to do on a move or a remove.
 * @returns The list item.
 */
export function ShownRow({
  row,
  onMove,
  onRemove,
}: {
  row: ColumnListRow;
  onMove: (row: ColumnListRow, step: -1 | 1) => void;
  onRemove: (id: string) => void;
}): ReactElement {
  const model = useModel();
  const { locale } = model;
  const metaId = useId();
  const spec = model.specs.get(row.id);
  const header = spec?.header || row.id;
  const meta = metaText(model, row);
  const movable = row.index !== -1;
  const { ref, handleRef, isDragSource } = useSortable({
    id: row.id,
    index: Math.max(row.index, 0),
    group: row.region,
    type: row.region,
    accept: row.region,
    disabled: !movable,
  });
  return (
    <li
      ref={movable ? ref : undefined}
      className="tv-shown-row"
      data-column-id={row.id}
      data-dragging={isDragSource || undefined}
    >
      {movable ? (
        <button
          ref={handleRef}
          type="button"
          className="tv-icon-button tv-shown-grip"
          aria-label={`${locale.dragColumn} ${header}`}
          aria-describedby={meta ? metaId : undefined}
          onKeyDown={(event) => {
            if (event.key === ' ' || event.key === 'Enter') markDragging(event.currentTarget, true);
          }}
        >
          <Icon name="grip" />
        </button>
      ) : (
        <span className="tv-shown-grip" />
      )}
      <span className="tv-shown-text">
        <span className="tv-column-name">{header}</span>
        {meta && (
          <span id={metaId} className="tv-column-meta">
            {meta}
          </span>
        )}
      </span>
      <RowButtons row={row} header={header} onMove={onMove} onRemove={onRemove} />
    </li>
  );
}
