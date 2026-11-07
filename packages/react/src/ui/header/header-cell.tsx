import { useSortable } from '@dnd-kit/react/sortable';
import type { ReactElement } from 'react';

import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { TanStackColumn, TanStackHeader } from '../../table/tanstack.type.ts';
import { cx } from '../common/cx.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { pinProps } from '../common/pin-props.ts';
import { HeaderMenuButton } from './header-menu-button.tsx';
import { ResizeHandle } from './resize-handle.tsx';

/** `aria-sort` for each sort direction. */
const ARIA_SORT = { asc: 'ascending', desc: 'descending' } as const;

/**
 * The state attributes of a header cell, for styling and assistive technology.
 * @param column The column.
 * @param dragging Whether the header is being dragged.
 * @returns Attributes to spread on the `<th>`.
 */
function stateAttributes<TRow>(
  column: TanStackColumn<TRow>,
  dragging: boolean,
): Record<string, string | true | undefined> {
  const sorted = column.getIsSorted();
  return {
    'aria-sort': sorted ? ARIA_SORT[sorted] : undefined,
    'data-sorted': sorted || undefined,
    'data-filtered': column.getIsFiltered() || undefined,
    'data-dragging': dragging || undefined,
  };
}

/**
 * A column header: the label (click to sort, Shift-click to add to the sort), a drag handle, the
 * options menu and the resize grip. The drag handle is the only place a drag starts, so sorting
 * clicks and resizing never turn into a drag by accident.
 * @param props The header, its spec, its position in its region and whether it casts the pin shadow.
 * @returns The header cell.
 */
export function HeaderCell<TRow>({
  header,
  spec,
  region,
  index,
  edge,
}: {
  header: TanStackHeader<TRow>;
  spec: ColumnSpec<TRow>;
  region: 'start' | 'center' | 'end';
  index: number;
  edge: boolean;
}): ReactElement {
  const model = useModel<TRow>();
  const { column } = header;
  const { reorderable, align } = spec.settings;
  const { ref, handleRef, isDragSource } = useSortable({
    id: column.id,
    index,
    group: region,
    type: region,
    accept: region,
    disabled: !reorderable,
  });
  const sortIndex = model.query.sort.length > 1 ? column.getSortIndex() + 1 : 0;
  return (
    <th
      ref={ref}
      scope="col"
      className={cx('tv-th', model.classNames.headerCell)}
      data-align={align}
      {...stateAttributes(column, isDragSource)}
      {...pinProps(column, edge)}
    >
      <div className="tv-th-inner">
        {reorderable && (
          <button
            ref={handleRef}
            type="button"
            className="tv-drag"
            aria-label={`${model.locale.dragColumn} ${spec.header}`}
          >
            <Icon name="grip" />
          </button>
        )}
        <SortLabel column={column} label={spec.header} sortIndex={sortIndex} />
        <HeaderMenuButton column={column} spec={spec} />
      </div>
      {column.getCanResize() && (
        <ResizeHandle
          header={header}
          table={model.table}
          label={`${model.locale.resizeColumn} ${spec.header}`}
        />
      )}
    </th>
  );
}

/**
 * The header label: a sort button when the column sorts, plain text otherwise.
 * @param props The column, its label and its position in a multi-column sort (0 when single).
 * @returns The label.
 */
function SortLabel<TRow>({
  column,
  label,
  sortIndex,
}: {
  column: TanStackColumn<TRow>;
  label: string;
  sortIndex: number;
}): ReactElement {
  if (!column.getCanSort()) return <span className="tv-th-label">{label}</span>;
  const sorted = column.getIsSorted();
  const icon = sorted === 'desc' ? 'sortDesc' : 'sortAsc';
  return (
    <button
      type="button"
      className="tv-th-label tv-sort"
      onClick={column.getToggleSortingHandler()}
    >
      <span className="tv-truncate">{label}</span>
      <span className="tv-sort-icon" data-active={sorted ? true : undefined}>
        <Icon name={sorted ? icon : 'sortable'} />
        {sortIndex > 0 && <sup>{sortIndex}</sup>}
      </span>
    </button>
  );
}
