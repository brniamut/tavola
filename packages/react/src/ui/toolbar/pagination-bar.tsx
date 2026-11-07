import { useId, type ReactElement } from 'react';

import { cx } from '../common/cx.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';

/**
 * The footer: rows per page, the range shown, and previous and next page.
 * @returns The footer.
 */
export function PaginationBar(): ReactElement {
  const { table, locale, query, total, pageSizes, classNames, canNextPage } = useModel();
  const rowsOnPage = table.getRowModel().rows.length;
  const sizeId = useId();
  const { index, size } = query.page;
  const first = rowsOnPage === 0 ? 0 : index * size + 1;
  const last = index * size + rowsOnPage;
  return (
    <div className={cx('tv-footer', classNames.footer)}>
      <label className="tv-page-size" htmlFor={sizeId}>
        {locale.rowsPerPage}
      </label>
      <select
        id={sizeId}
        className="tv-select-input"
        value={size}
        onChange={(event) => table.setPageSize(Number(event.target.value))}
      >
        {pageSizes.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <span className="tv-spacer" />
      <span className="tv-range-text" aria-live="polite">
        {locale.range(first, last, total)}
      </span>
      <button
        type="button"
        className="tv-icon-button"
        aria-label={locale.previousPage}
        disabled={!table.getCanPreviousPage()}
        onClick={() => table.previousPage()}
      >
        <Icon name="chevronLeft" />
      </button>
      <button
        type="button"
        className="tv-icon-button"
        aria-label={locale.nextPage}
        disabled={!canNextPage}
        onClick={() => table.nextPage()}
      >
        <Icon name="chevronRight" />
      </button>
    </div>
  );
}
