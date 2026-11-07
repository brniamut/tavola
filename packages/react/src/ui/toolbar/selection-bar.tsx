import { useState, type ReactElement } from 'react';

import type { BulkAction } from '../../table/data-table-props.type.ts';
import { cx } from '../common/cx.ts';
import { useModel } from '../common/model-context.ts';

/**
 * The bar shown while rows are selected: the count, "select all matching", the bulk actions and
 * a way to clear the selection. Actions are disabled while one that returned a promise runs.
 * @returns The bar, or nothing when no row is selected.
 */
export function SelectionBar(): ReactElement | null {
  const model = useModel();
  const { table, locale, total } = model;
  const [busy, setBusy] = useState(false);
  const { rowSelection } = table.state;
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]);
  if (selectedIds.length === 0 && !model.allMatching) return null;

  const count = selectedIds.length;
  // With an unknown total (cursor APIs) there may be more rows than the page; offer it then too.
  const canSelectAll = table.getIsAllPageRowsSelected() && (total === null || count < total);
  const selectAll = (): void =>
    model.serverMode ? model.setAllMatching(true) : table.toggleAllRowsSelected(true);
  const run = async (action: BulkAction<unknown>): Promise<void> => {
    setBusy(true);
    try {
      await action.onAction(model.getSelection());
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="tv-selection-bar" aria-label={locale.selected(count)}>
      <span className="tv-selection-count" aria-live="polite">
        {model.allMatching ? locale.allMatchingSelected(total) : locale.selected(count)}
      </span>
      {canSelectAll && !model.allMatching && (
        <button type="button" className="tv-link" onClick={selectAll}>
          {locale.selectAllMatching(total)}
        </button>
      )}
      <span className="tv-spacer" />
      {model.bulkActions.map((action) => (
        <button
          key={action.label}
          type="button"
          className={cx('tv-button', action.danger && 'tv-danger')}
          disabled={busy}
          onClick={() => void run(action)}
        >
          {action.label}
        </button>
      ))}
      <button type="button" className="tv-link" onClick={() => model.getSelection().clear()}>
        {locale.clearSelection}
      </button>
    </section>
  );
}
