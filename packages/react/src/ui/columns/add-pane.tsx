import { useId, useState, type ReactElement } from 'react';

import type { ViewLayout } from '../../views/saved-view.type.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { hiddenGroups } from './hidden-groups.ts';
import { setVisible } from './set-visible.ts';

/**
 * One group of hidden columns, each with a button that adds it to the end of the shown list.
 * @param props The group name (empty for columns without one), its column ids, and what to do on an add.
 * @returns The group.
 */
function AddGroup({
  group,
  ids,
  onAdd,
}: {
  group: string;
  ids: readonly string[];
  onAdd: (id: string) => void;
}): ReactElement {
  const { specs, locale } = useModel();
  const headingId = useId();
  return (
    <div className="tv-add-group">
      <h4 id={headingId} className="tv-add-heading">
        {group || locale.otherColumns}
      </h4>
      <ul className="tv-add-list" aria-labelledby={headingId}>
        {ids.map((id) => {
          const header = specs.get(id)?.header || id;
          return (
            <li key={id} className="tv-add-row">
              <span className="tv-column-name">{header}</span>
              <button
                type="button"
                className="tv-icon-button"
                data-focus-key={`add:${id}`}
                aria-label={`${locale.addColumn} ${header}`}
                onClick={() => onAdd(id)}
              >
                <Icon name="plus" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * The right pane: the hidden columns, grouped and searchable. Adding one puts it at the end of
 * the shown list.
 * @param props The draft columns, what to do with a change, and a function that moves focus.
 * @returns The pane.
 */
export function AddPane({
  layout,
  onChange,
  focusLater,
}: {
  layout: ViewLayout;
  onChange: (layout: ViewLayout) => void;
  focusLater: (...keys: string[]) => void;
}): ReactElement {
  const { specs, locale } = useModel();
  const [search, setSearch] = useState('');
  const headingId = useId();
  const groups = hiddenGroups(layout, specs, search);
  const anyHidden = hiddenGroups(layout, specs, '').length > 0;
  const add = (id: string): void => {
    onChange(setVisible(layout, id, true));
    focusLater(`remove:${id}`);
  };
  return (
    <section className="tv-pane tv-add-pane" aria-labelledby={headingId}>
      <h3 id={headingId} className="tv-pane-heading">
        {locale.addColumns}
      </h3>
      <label className="tv-search tv-column-search">
        <Icon name="search" />
        <input
          type="search"
          className="tv-search-input"
          placeholder={locale.findColumn}
          aria-label={locale.findColumn}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && event.preventDefault()}
        />
      </label>
      <div className="tv-add-groups">
        {groups.map(({ group, ids }) => (
          <AddGroup key={group} group={group} ids={ids} onAdd={add} />
        ))}
        {groups.length === 0 && (
          <p className="tv-pane-empty">
            {anyHidden ? locale.noColumnsFound : locale.allColumnsShown}
          </p>
        )}
      </div>
    </section>
  );
}
