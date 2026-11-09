import { useState, type ReactElement } from 'react';

import { viewLayoutOf } from '../../views/view-layout-of.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { applyDraft } from './apply-draft.ts';
import type { ColumnDraft } from './column-draft.type.ts';
import { ColumnList } from './column-list.tsx';
import { PresetButtons } from './preset-buttons.tsx';
import { ViewFields } from './view-fields.tsx';

/**
 * The title, the line under it and the close button.
 * @param props The id for the title, and a function that closes the picker.
 * @returns The header.
 */
function EditorHeader({
  titleId,
  onClose,
}: {
  titleId: string;
  onClose: () => void;
}): ReactElement {
  const { locale } = useModel();
  return (
    <header className="tv-dialog-header">
      <div>
        <h2 id={titleId} className="tv-dialog-title">
          {locale.columnsTitle}
        </h2>
        <p className="tv-dialog-description">{locale.columnsDescription}</p>
      </div>
      <button type="button" className="tv-icon-button" aria-label={locale.close} onClick={onClose}>
        <Icon name="close" />
      </button>
    </header>
  );
}

/**
 * The content of the column picker. Changes stay in a draft until "Apply"; "Cancel" and Escape
 * drop them.
 * @param props The id for the title, and a function that closes the picker.
 * @returns The form.
 */
export function ColumnEditor({
  titleId,
  onDone,
}: {
  titleId: string;
  onDone: () => void;
}): ReactElement {
  const model = useModel();
  const { locale } = model;
  const [draft, setDraft] = useState<ColumnDraft>(() => ({
    layout: viewLayoutOf(model.layout),
    query: null,
    name: '',
    view: '',
  }));
  const update = (patch: Partial<ColumnDraft>): void =>
    setDraft((current) => ({ ...current, ...patch }));
  return (
    <form
      className="tv-dialog-form"
      onSubmit={(event) => {
        event.preventDefault();
        applyDraft(model, draft);
        onDone();
      }}
    >
      <EditorHeader titleId={titleId} onClose={onDone} />
      <div className="tv-dialog-body">
        <PresetButtons layout={draft.layout} onPick={(layout) => update({ layout })} />
        <ColumnList layout={draft.layout} onChange={(layout) => update({ layout })} />
        {model.setViews && <ViewFields draft={draft} onChange={update} />}
      </div>
      <footer className="tv-dialog-footer">
        <button
          type="button"
          className="tv-button"
          onClick={() => update({ layout: viewLayoutOf(model.defaults) })}
        >
          {locale.resetLayout}
        </button>
        <span className="tv-spacer" />
        <button type="button" className="tv-button" onClick={onDone}>
          {locale.cancel}
        </button>
        <button type="submit" className="tv-button tv-primary">
          {locale.apply}
        </button>
      </footer>
    </form>
  );
}
