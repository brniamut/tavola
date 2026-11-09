import type { TavolaModel } from '../../table/tavola-model.type.ts';
import { upsertView } from '../../views/upsert-view.ts';
import type { ColumnDraft } from './column-draft.type.ts';

/**
 * Applies the column picker's draft: the columns, the query of a loaded view (from the first
 * page), and saves the view when the user gave it a name.
 * @param model The table model.
 * @param draft The draft.
 */
export function applyDraft<TRow>(model: TavolaModel<TRow>, draft: ColumnDraft): void {
  const { query, layout } = draft;
  model.setLayout((current) => ({ ...current, ...layout }));
  if (query) {
    model.setQuery((current) => ({
      ...current,
      ...query,
      page: { index: 0, size: current.page.size },
    }));
  }
  const name = draft.name.trim();
  if (!name || !model.setViews) return;
  const { sort, filters, search } = model.query;
  const view = { name, layout, query: query ?? { sort, filters, search } };
  model.setViews(upsertView(model.views, view));
}
