import { memo, type MouseEvent, type ReactElement, type ReactNode } from 'react';

import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { TanStackCell, TanStackColumn, TanStackRow } from '../../table/tanstack.type.ts';
import { SELECT_COLUMN_ID } from '../../table/to-column-defs.ts';
import type { RowModelProps } from './body-row.type.ts';
import { Checkbox } from '../common/checkbox.tsx';
import { cx } from '../common/cx.ts';
import { pinProps } from '../common/pin-props.ts';
import { formatValue } from './format-value.ts';
import { RowActionsMenu } from './row-actions-menu.tsx';

/** Clicks on these do their own thing and do not count as a row click. */
const INTERACTIVE = 'a, button, input, select, textarea, label, [role="menu"], [role="dialog"]';

/**
 * What a cell shows: the checkbox, the row actions, the developer's renderer or the formatted value.
 * @param cell The TanStack cell.
 * @param spec The column spec, absent for the selection column.
 * @param model Formats, texts and class names.
 * @returns The cell content.
 */
function cellContent<TRow>(
  cell: TanStackCell<TRow>,
  spec: ColumnSpec<TRow> | undefined,
  model: RowModelProps<TRow>['model'],
): ReactNode {
  const { row } = cell;
  if (cell.column.id === SELECT_COLUMN_ID)
    return (
      <Checkbox
        label={model.locale.selectRow}
        checked={row.getIsSelected()}
        disabled={!row.getCanSelect()}
        onClick={row.getToggleSelectedHandler()}
      />
    );
  if (!spec) return null;
  const original = row.original;
  if (spec.actions)
    return <RowActionsMenu actions={spec.actions(original)} label={model.locale.rowActions} />;
  const value = cell.getValue();
  if (spec.render) return spec.render(original, value);
  return formatValue(spec as ColumnSpec<unknown>, value, model);
}

/**
 * One body cell, with its alignment, sort and pin state, and a tooltip for plain text so a value
 * cut off by the column width can still be read.
 * @param props The cell, whether it casts the pin shadow, and the model parts.
 * @returns The `<td>`.
 */
function BodyCell<TRow>({
  cell,
  edge,
  model,
}: RowModelProps<TRow> & { cell: TanStackCell<TRow>; edge: boolean }): ReactElement {
  const { column, row } = cell;
  const spec = model.specs.get(column.id);
  const custom = spec?.settings.className;
  const extra = typeof custom === 'function' ? custom(row.original) : custom;
  const content = cellContent(cell, spec, model);
  return (
    <td
      className={cx(
        'tv-td',
        column.id === SELECT_COLUMN_ID && 'tv-select',
        model.classNames.cell,
        extra,
      )}
      data-align={spec?.settings.align}
      data-sorted={column.getIsSorted() || undefined}
      title={typeof content === 'string' && content !== '' ? content : undefined}
      {...pinProps(column, edge)}
    >
      {content}
    </td>
  );
}

/**
 * One body row. Memoised: it rerenders when its data, its selection, the visible columns, the
 * sorted columns or the column specs change, not when another row is selected or a column is
 * resized.
 * @param props The row, the visible columns per region and their key, the sort, and the model parts.
 * @returns The `<tr>`.
 */
function BodyRowImpl<TRow>({
  row,
  regions,
  model,
}: RowModelProps<TRow> & {
  row: TanStackRow<TRow>;
  regions: {
    start: TanStackColumn<TRow>[];
    center: TanStackColumn<TRow>[];
    end: TanStackColumn<TRow>[];
    key: string;
  };
  selected: boolean;
  sortKey: string;
}): ReactElement {
  const cells = row.getVisibleCellsByColumnId();
  const onClick = model.onRowClick
    ? (event: MouseEvent) => {
        if (!(event.target as Element).closest(INTERACTIVE)) model.onRowClick?.(row.original);
      }
    : undefined;
  const renderCell = (column: TanStackColumn<TRow>, edge: boolean): ReactElement | null => {
    const cell = cells[column.id];
    return cell ? <BodyCell key={column.id} cell={cell} edge={edge} model={model} /> : null;
  };
  const { start, center, end } = regions;
  return (
    <tr
      className={cx('tv-tr', model.classNames.row)}
      data-selected={row.getIsSelected() || undefined}
      data-clickable={onClick ? true : undefined}
      onClick={onClick}
    >
      {start.map((column, index) => renderCell(column, index === start.length - 1))}
      {center.map((column) => renderCell(column, false))}
      <td className="tv-filler" aria-hidden="true" />
      {end.map((column, index) => renderCell(column, index === 0))}
    </tr>
  );
}

/** One body row, memoised. See `BodyRowImpl`. */
export const BodyRow = memo(
  BodyRowImpl,
  (previous, next) =>
    previous.row === next.row &&
    previous.selected === next.selected &&
    previous.sortKey === next.sortKey &&
    previous.regions.key === next.regions.key &&
    previous.model.specs === next.model.specs &&
    previous.model.formats === next.model.formats &&
    previous.model.locale === next.model.locale,
) as typeof BodyRowImpl;
