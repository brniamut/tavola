import type { ReactElement } from 'react';

import type { TanStackColumn } from '../../table/tanstack.type.ts';
import { SELECT_COLUMN_ID } from '../../table/to-column-defs.ts';
import { Checkbox } from '../common/checkbox.tsx';
import { columnRegions } from '../common/column-regions.ts';
import { cx } from '../common/cx.ts';
import { useModel } from '../common/model-context.ts';
import { pinProps } from '../common/pin-props.ts';
import { HeaderCell } from './header-cell.tsx';

/**
 * The header row. Each header can be dragged within its region; `ColumnDrag` around the table
 * handles the drop.
 * @returns The `<thead>`.
 */
export function TableHead(): ReactElement {
  const model = useModel();
  const regions = columnRegions(model.table);
  const headersById = new Map(
    model.table.getFlatHeaders().map((header) => [header.column.id, header]),
  );
  const renderRegion = (
    region: 'start' | 'center' | 'end',
    columns: TanStackColumn<unknown>[],
  ): (ReactElement | null)[] => {
    const offset = columns[0]?.id === SELECT_COLUMN_ID ? 1 : 0;
    return columns.map((column, position) => {
      const edge =
        (region === 'start' && position === columns.length - 1) ||
        (region === 'end' && position === 0);
      const header = headersById.get(column.id);
      const spec = model.specs.get(column.id);
      if (column.id === SELECT_COLUMN_ID)
        return <SelectAllCell key={column.id} column={column} edge={edge} />;
      if (!header || !spec) return null;
      return (
        <HeaderCell
          key={column.id}
          header={header}
          spec={spec}
          region={region}
          index={position - offset}
          edge={edge}
        />
      );
    });
  };

  return (
    <thead className="tv-thead">
      <tr className={cx('tv-tr', model.classNames.headerRow)}>
        {renderRegion('start', regions.start)}
        {renderRegion('center', regions.center)}
        <th className="tv-filler" aria-hidden="true" />
        {renderRegion('end', regions.end)}
      </tr>
    </thead>
  );
}

/**
 * The header of the selection column: selects or clears every row on the page.
 * @param props The selection column and whether it casts the pin shadow.
 * @returns The header cell.
 */
function SelectAllCell<TRow>({
  column,
  edge,
}: {
  column: TanStackColumn<TRow>;
  edge: boolean;
}): ReactElement {
  const { table, locale } = useModel<TRow>();
  return (
    <th scope="col" className="tv-th tv-select" {...pinProps(column, edge)}>
      <Checkbox
        label={locale.selectPage}
        checked={table.getIsAllPageRowsSelected()}
        indeterminate={table.getIsSomePageRowsSelected()}
        disabled={table.getRowModel().rows.length === 0}
        onClick={table.getToggleAllPageRowsSelectedHandler()}
      />
    </th>
  );
}
