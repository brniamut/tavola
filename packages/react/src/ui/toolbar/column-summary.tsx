import type { ReactElement } from 'react';

import { ACTIONS_COLUMN_ID } from '../../columns/column-sizes.ts';
import { useModel } from '../common/model-context.ts';

/**
 * "8 of 12 columns visible", shown only while columns are hidden: by the user, or because the
 * table is too narrow for them. The button opens the column picker.
 * @param props A function that opens the column picker, given the button that opens it.
 * @returns The line, or null when every column is visible.
 */
export function ColumnSummary({
  onOpen,
}: {
  onOpen: (opener: HTMLElement) => void;
}): ReactElement | null {
  const { table, specs, locale, columnSummary } = useModel();
  const listed = [...specs.keys()].filter((id) => id !== ACTIONS_COLUMN_ID);
  const visible = listed.filter((id) => table.getColumn(id)?.getIsVisible()).length;
  if (!columnSummary || visible === listed.length) return null;
  return (
    <div className="tv-column-summary">
      <span>{locale.columnSummary(visible, listed.length)}</span>
      <button type="button" className="tv-link" onClick={(event) => onOpen(event.currentTarget)}>
        {locale.chooseColumns}
      </button>
    </div>
  );
}
