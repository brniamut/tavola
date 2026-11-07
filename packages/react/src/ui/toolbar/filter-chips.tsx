import type { ReactElement } from 'react';

import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { describeFilter } from './describe-filter.ts';

/**
 * The active filters as removable chips, so a user always sees why rows are missing.
 * @returns The chips, or nothing without filters.
 */
export function FilterChips(): ReactElement | null {
  const model = useModel();
  const entries = Object.entries(model.query.filters).filter(([id]) => model.specs.has(id));
  if (entries.length === 0) return null;
  const remove = (id: string): void =>
    model.setQuery((query) => {
      const { [id]: _removed, ...filters } = query.filters;
      return { ...query, filters, page: { ...query.page, index: 0 } };
    });
  return (
    <ul className="tv-chips" aria-label={model.locale.filter}>
      {entries.map(([id, filter]) => {
        const text = describeFilter(model.specs.get(id) as ColumnSpec<unknown>, filter, model);
        return (
          <li key={id} className="tv-chip">
            <span className="tv-truncate">{text}</span>
            <button
              type="button"
              className="tv-chip-remove"
              aria-label={`${model.locale.clearFilter}: ${text}`}
              onClick={() => remove(id)}
            >
              <Icon name="close" />
            </button>
          </li>
        );
      })}
      {entries.length > 1 && (
        <li>
          <button
            type="button"
            className="tv-link"
            onClick={() =>
              model.setQuery((query) => ({
                ...query,
                filters: {},
                page: { ...query.page, index: 0 },
              }))
            }
          >
            {model.locale.clearAllFilters}
          </button>
        </li>
      )}
    </ul>
  );
}
