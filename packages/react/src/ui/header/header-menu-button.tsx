import type { ReactElement } from 'react';

import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { TanStackColumn } from '../../table/tanstack.type.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { Popover } from '../common/popover.tsx';
import { HeaderMenu } from './header-menu.tsx';

/**
 * The options button in a header, which opens the column menu. Its icon turns into a filter
 * icon while the column is filtered.
 * @param props The column and its spec.
 * @returns The button and menu, or nothing when the column has no options.
 */
export function HeaderMenuButton<TRow>({
  column,
  spec,
}: {
  column: TanStackColumn<TRow>;
  spec: ColumnSpec<TRow>;
}): ReactElement | null {
  const { locale, serverMode } = useModel();
  const { sortable, filterable } = spec.settings;
  if (!sortable && !filterable && !column.getCanHide() && !column.getCanPin()) return null;
  const label = `${locale.columnMenu}: ${spec.header}`;
  return (
    <Popover
      label={label}
      align={spec.settings.align === 'end' ? 'end' : 'start'}
      trigger={(props) => (
        <button {...props} type="button" className="tv-th-menu" aria-label={label}>
          <Icon name={column.getIsFiltered() ? 'filter' : 'more'} />
        </button>
      )}
    >
      {(close) => (
        <HeaderMenu
          column={column}
          spec={spec}
          locale={locale}
          serverMode={serverMode}
          close={close}
        />
      )}
    </Popover>
  );
}
