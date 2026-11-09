import { useId, type ReactElement } from 'react';

import { fitViewLayout } from '../../views/fit-view-layout.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import type { ColumnDraft } from './column-draft.type.ts';

/**
 * The list of saved views and a button that deletes the chosen one.
 * @param props The chosen view's name, and what to do on a choice or a delete.
 * @returns The field.
 */
function SavedViewPicker({
  value,
  onLoad,
  onDelete,
}: {
  value: string;
  onLoad: (name: string) => void;
  onDelete: () => void;
}): ReactElement {
  const { locale, views } = useModel();
  const pickId = useId();
  return (
    <div className="tv-field">
      <label htmlFor={pickId}>{locale.savedViews}</label>
      <div className="tv-view-pick">
        <select
          id={pickId}
          className="tv-select-input"
          value={value}
          onChange={(event) => onLoad(event.target.value)}
        >
          <option value="">{locale.chooseView}</option>
          {views.map((view) => (
            <option key={view.name} value={view.name}>
              {view.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="tv-icon-button"
          aria-label={locale.deleteView}
          disabled={!value}
          onClick={onDelete}
        >
          <Icon name="trash" />
        </button>
      </div>
    </div>
  );
}

/**
 * Saving the draft as a named view, and loading or deleting a saved one. Loading fills the draft;
 * the view's filters, sort and search are applied together with its columns.
 * @param props The draft and a function that receives changes to it.
 * @returns The fields.
 */
export function ViewFields({
  draft,
  onChange,
}: {
  draft: ColumnDraft;
  onChange: (patch: Partial<ColumnDraft>) => void;
}): ReactElement {
  const { locale, views, setViews, specs, defaults } = useModel();
  const load = (name: string): void => {
    const view = views.find((candidate) => candidate.name === name);
    if (!view) return onChange({ view: '', query: null });
    const layout = fitViewLayout(view.layout, [...specs.values()], defaults);
    onChange({ view: name, name, query: view.query, layout });
  };
  const remove = (): void => {
    setViews?.(views.filter((view) => view.name !== draft.view));
    onChange({ view: '', query: null });
  };
  return (
    <div className="tv-view-fields">
      <label className="tv-field">
        {locale.saveViewAs}
        <input
          className="tv-input"
          value={draft.name}
          placeholder={locale.saveViewPlaceholder}
          onChange={(event) => onChange({ name: event.target.value })}
        />
      </label>
      {views.length > 0 && <SavedViewPicker value={draft.view} onLoad={load} onDelete={remove} />}
      <p className="tv-dialog-note">{locale.viewHint}</p>
    </div>
  );
}
