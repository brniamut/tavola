import type { ReactElement } from 'react';

import { cx } from '../common/cx.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { DensityMenu } from './density-menu.tsx';
import { FilterChips } from './filter-chips.tsx';
import { SearchInput } from './search-input.tsx';

/**
 * The bar above the table: search, active filters, your own content, density and columns.
 * @param props A function that opens the column picker, given the button that opens it.
 * @returns The toolbar.
 */
export function TableToolbar({
  onOpenColumns,
}: {
  onOpenColumns: (opener: HTMLElement) => void;
}): ReactElement {
  const { locale, classNames, toolbar } = useModel();
  return (
    <div className={cx('tv-toolbar', classNames.toolbar)}>
      <SearchInput />
      <FilterChips />
      <span className="tv-spacer" />
      {toolbar}
      <DensityMenu />
      <button
        type="button"
        className="tv-button"
        aria-haspopup="dialog"
        onClick={(event) => onOpenColumns(event.currentTarget)}
      >
        <Icon name="columns" />
        {locale.columns}
      </button>
    </div>
  );
}
