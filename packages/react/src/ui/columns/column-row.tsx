import { useId, type ReactElement } from 'react';

import type { TavolaModel } from '../../table/tavola-model.type.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import type { ColumnListRow } from './column-draft.type.ts';

/**
 * Whether a column the user turned on is hidden anyway, because the table is too narrow for it.
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
 * @param visible Whether the column is on in the draft.
 * @returns The texts that apply, joined; empty when none do.
 */
function metaText(model: TavolaModel<unknown>, row: ColumnListRow, visible: boolean): string {
  const { specs, locale } = model;
  const settings = specs.get(row.id)?.settings;
  const squeezed = visible && isSqueezed(model, row.id);
  const parts = [
    settings?.group,
    settings?.hideable === false && locale.alwaysShown,
    row.region === 'start' && locale.pinnedStart,
    row.region === 'end' && locale.pinnedEnd,
    squeezed && locale.hiddenForSpace,
  ];
  return parts.filter(Boolean).join(' · ');
}

/**
 * The up and down arrows of a column. They move it among the columns of its region that can move.
 * @param props The row, the header for the labels, and what to do on a move.
 * @returns The two buttons.
 */
function MoveButtons({
  row,
  header,
  onMove,
}: {
  row: ColumnListRow;
  header: string;
  onMove: (row: ColumnListRow, step: -1 | 1) => void;
}): ReactElement {
  const { locale } = useModel();
  const last = row.movable.length - 1;
  return (
    <span className="tv-column-moves">
      <button
        type="button"
        className="tv-icon-button"
        data-dir="up"
        aria-label={`${locale.moveUp} ${header}`}
        disabled={row.index <= 0}
        onClick={() => onMove(row, -1)}
      >
        <Icon name="chevronUp" />
      </button>
      <button
        type="button"
        className="tv-icon-button"
        data-dir="down"
        aria-label={`${locale.moveDown} ${header}`}
        disabled={row.index === -1 || row.index === last}
        onClick={() => onMove(row, 1)}
      >
        <Icon name="chevronDown" />
      </button>
    </span>
  );
}

/**
 * One column in the picker: a checkbox to show it, its group and state, and arrows to move it.
 * @param props The row, whether it is on in the draft, and what to do on a toggle or a move.
 * @returns The list item.
 */
export function ColumnRow({
  row,
  visible,
  onToggle,
  onMove,
}: {
  row: ColumnListRow;
  visible: boolean;
  onToggle: (id: string) => void;
  onMove: (row: ColumnListRow, step: -1 | 1) => void;
}): ReactElement {
  const model = useModel();
  const metaId = useId();
  const spec = model.specs.get(row.id);
  const header = spec?.header || row.id;
  const meta = metaText(model, row, visible);
  return (
    <li className="tv-column-row" data-column-id={row.id} data-hidden={!visible || undefined}>
      <label className="tv-column-label">
        <input
          type="checkbox"
          className="tv-checkbox"
          checked={visible}
          disabled={spec?.settings.hideable === false}
          aria-describedby={meta ? metaId : undefined}
          onChange={() => onToggle(row.id)}
        />
        <span className="tv-column-name">{header}</span>
      </label>
      {meta && (
        <span id={metaId} className="tv-column-meta">
          {meta}
        </span>
      )}
      <MoveButtons row={row} header={header} onMove={onMove} />
    </li>
  );
}
