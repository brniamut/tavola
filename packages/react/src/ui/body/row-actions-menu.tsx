import type { ReactElement } from 'react';

import type { RowAction } from '../../columns/column-spec.type.ts';
import { cx } from '../common/cx.ts';
import { Icon } from '../common/icon.tsx';
import { Popover } from '../common/popover.tsx';

/**
 * The menu button at the end of a row.
 * @param props The row's actions and the button label.
 * @returns The button and its menu, or nothing when the row has no actions.
 */
export function RowActionsMenu({
  actions,
  label,
}: {
  actions: readonly RowAction[];
  label: string;
}): ReactElement | null {
  if (actions.length === 0) return null;
  return (
    <Popover
      label={label}
      role="menu"
      align="end"
      trigger={(props) => (
        <button {...props} type="button" className="tv-icon-button" aria-label={label}>
          <Icon name="more" />
        </button>
      )}
    >
      {(close) => (
        <div className="tv-menu">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              role="menuitem"
              className={cx('tv-menu-item', action.danger && 'tv-danger')}
              disabled={action.disabled}
              onClick={() => {
                close();
                action.onSelect();
              }}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </Popover>
  );
}
