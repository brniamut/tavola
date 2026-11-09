import { useCallback, useState, type ReactElement } from 'react';

import type { DataTableProps } from './table/data-table-props.type.ts';
import { useTavola } from './table/use-tavola.ts';
import { TableBody } from './ui/body/table-body.tsx';
import { columnRegions } from './ui/common/column-regions.ts';
import { ColumnDialog } from './ui/columns/column-dialog.tsx';
import { cx } from './ui/common/cx.ts';
import { ModelContext } from './ui/common/model-context.ts';
import { pinOffsetVariables } from './ui/common/pin-offset-variables.ts';
import { useScrollEdges } from './ui/common/use-scroll-edges.ts';
import { ColumnDrag } from './ui/header/column-drag.tsx';
import { TableHead } from './ui/header/table-head.tsx';
import { ColumnSummary } from './ui/toolbar/column-summary.tsx';
import { PaginationBar } from './ui/toolbar/pagination-bar.tsx';
import { SelectionBar } from './ui/toolbar/selection-bar.tsx';
import { TableToolbar } from './ui/toolbar/table-toolbar.tsx';

/**
 * An admin data table: search, column filters, multi-column sort, a column picker, drag-to-reorder,
 * resizing, pinning, row selection with bulk actions, pagination and a remembered layout.
 *
 * Pass `data` and the table sorts, filters and pages in the browser. Pass `fetcher` and it sends
 * one query object to your server instead.
 *
 * @example
 * <DataTable id="users" columns={columns} data={users} getRowId={(user) => user.id} />
 * @param props See `DataTableProps`.
 * @returns The table with its toolbar and footer.
 */
export function DataTable<TRow>(props: DataTableProps<TRow>): ReactElement {
  const model = useTavola(props);
  const { table, layout, classNames, measureScroller, total, loading } = model;
  const regions = columnRegions(table);
  const columns = [...regions.start, ...regions.center];
  // The button that opened the column picker, or null while it is closed.
  const [columnsOpener, setColumnsOpener] = useState<HTMLElement | null>(null);
  const trackScroll = useScrollEdges();
  const scrollerRef = useCallback(
    (element: HTMLDivElement | null) => {
      measureScroller(element);
      trackScroll(element);
    },
    [measureScroller, trackScroll],
  );
  return (
    <ModelContext.Provider value={model as never}>
      <div
        className={cx('tv-root', classNames.root)}
        data-density={layout.density}
        data-tv-theme={props.theme === 'cotto' ? undefined : props.theme}
        data-loading={loading || undefined}
      >
        <TableToolbar onOpenColumns={setColumnsOpener} />
        <SelectionBar />
        <ColumnSummary onOpen={setColumnsOpener} />
        <div ref={scrollerRef} className={cx('tv-scroller', classNames.scroller)}>
          <ColumnDrag>
            <table
              className={cx('tv-table', classNames.table)}
              aria-label={props.label}
              aria-rowcount={total ?? -1}
              style={{
                ...pinOffsetVariables(regions.start, regions.end),
                minWidth: table.getTotalSize(),
              }}
            >
              <colgroup>
                {columns.map((column) => (
                  <col key={column.id} style={{ width: column.getSize() }} />
                ))}
                <col />
                {regions.end.map((column) => (
                  <col key={column.id} style={{ width: column.getSize() }} />
                ))}
              </colgroup>
              <TableHead />
              <TableBody />
            </table>
          </ColumnDrag>
        </div>
        <PaginationBar />
        <ColumnDialog opener={columnsOpener} onClose={() => setColumnsOpener(null)} />
      </div>
    </ModelContext.Provider>
  );
}
