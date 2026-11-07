import { useCallback, type ReactElement } from 'react';

import type { DataTableProps } from './table/data-table-props.type.ts';
import { useTavola } from './table/use-tavola.ts';
import { TableBody } from './ui/body/table-body.tsx';
import { columnRegions } from './ui/common/column-regions.ts';
import { cx } from './ui/common/cx.ts';
import { ModelContext } from './ui/common/model-context.ts';
import { pinOffsetVariables } from './ui/common/pin-offset-variables.ts';
import { useScrollEdges } from './ui/common/use-scroll-edges.ts';
import { TableHead } from './ui/header/table-head.tsx';
import { FilterChips } from './ui/toolbar/filter-chips.tsx';
import { PaginationBar } from './ui/toolbar/pagination-bar.tsx';
import { SearchInput } from './ui/toolbar/search-input.tsx';
import { SelectionBar } from './ui/toolbar/selection-bar.tsx';
import { ViewMenu } from './ui/toolbar/view-menu.tsx';

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
        <div className={cx('tv-toolbar', classNames.toolbar)}>
          <SearchInput />
          <FilterChips />
          <span className="tv-spacer" />
          {props.toolbar}
          <ViewMenu />
        </div>
        <SelectionBar />
        <div ref={scrollerRef} className={cx('tv-scroller', classNames.scroller)}>
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
        </div>
        <PaginationBar />
      </div>
    </ModelContext.Provider>
  );
}
