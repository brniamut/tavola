import type { ReactElement, ReactNode } from 'react';

import type { TavolaModel } from '../../table/tavola-model.type.ts';
import { columnRegions } from '../common/column-regions.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { BodyRow } from './body-row.tsx';

/** Placeholder rows while the first page loads; at most this many. */
const MAX_SKELETON_ROWS = 8;

/**
 * Which body to show: rows, or the state that explains why there are none.
 * @param model The table model.
 * @param rowCount Rows on the current page.
 * @returns The state.
 */
function bodyState(
  model: TavolaModel<unknown>,
  rowCount: number,
): 'rows' | 'error' | 'loading' | 'empty' {
  if (rowCount > 0) return 'rows';
  if (model.error) return 'error';
  return model.loading ? 'loading' : 'empty';
}

/**
 * A single row spanning the table, for the empty and error states: an icon, a title and an
 * optional action.
 * @param props The number of columns to span, the state, the title and an action.
 * @returns The body with that one row.
 */
function StateBody({
  span,
  kind,
  title,
  children,
}: {
  span: number;
  kind: 'empty' | 'error';
  title: ReactNode;
  children?: ReactNode;
}): ReactElement {
  return (
    <tbody className="tv-tbody">
      <tr className="tv-state-row" data-state={kind}>
        <td className="tv-state" colSpan={span}>
          <div className="tv-state-inner" role={kind === 'error' ? 'alert' : undefined}>
            <span className="tv-state-icon">
              <Icon name={kind === 'error' ? 'alert' : 'table'} />
            </span>
            <p className="tv-state-title">{title}</p>
            {children}
          </div>
        </td>
      </tr>
    </tbody>
  );
}

/**
 * Placeholder rows while the first page loads.
 * @param props The number of columns to span, how many rows, and the loading text.
 * @returns The body with placeholder rows.
 */
function SkeletonBody({
  span,
  count,
  label,
}: {
  span: number;
  count: number;
  label: string;
}): ReactElement {
  return (
    <tbody className="tv-tbody" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <tr key={`skeleton-${String(index)}`} className="tv-tr tv-skeleton-row">
          <td colSpan={span} className="tv-td">
            {index === 0 ? <span className="tv-visually-hidden">{label}</span> : null}
            <span className="tv-skeleton" aria-hidden="true" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

/**
 * The "no rows" state. With filters or search active it says so and offers to clear them.
 * @param props The number of columns to span.
 * @returns The body.
 */
function EmptyBody({ span }: { span: number }): ReactElement {
  const { query, locale, empty, setQuery } = useModel();
  const filtered = query.search !== '' || Object.keys(query.filters).length > 0;
  const clear = (): void =>
    setQuery((current) => ({
      ...current,
      filters: {},
      search: '',
      page: { ...current.page, index: 0 },
    }));
  return (
    <StateBody
      span={span}
      kind="empty"
      title={filtered ? locale.noMatches : (empty ?? locale.empty)}
    >
      {filtered && (
        <button type="button" className="tv-button" onClick={clear}>
          {locale.clearFilters}
        </button>
      )}
    </StateBody>
  );
}

/**
 * The error state, with a retry button in server mode.
 * @param props The number of columns to span.
 * @returns The body.
 */
function ErrorBody({ span }: { span: number }): ReactElement {
  const { locale, retry } = useModel();
  return (
    <StateBody span={span} kind="error" title={locale.error}>
      {retry && (
        <button type="button" className="tv-button" onClick={retry}>
          {locale.retry}
        </button>
      )}
    </StateBody>
  );
}

/**
 * The body: rows, or the state that explains why there are none. While a later page loads, the
 * current rows stay and dim, so the table does not jump.
 * @returns The `<tbody>`.
 */
export function TableBody(): ReactElement {
  const model = useModel();
  const { table, locale, query } = model;
  const regions = columnRegions(table);
  const rows = table.getRowModel().rows;
  // Columns plus the filler cell.
  const span = regions.start.length + regions.center.length + regions.end.length + 1;
  const sortKey = query.sort.map((rule) => rule.id).join(',');

  switch (bodyState(model, rows.length)) {
    case 'error':
      return <ErrorBody span={span} />;
    case 'loading':
      return (
        <SkeletonBody
          span={span}
          count={Math.min(query.page.size, MAX_SKELETON_ROWS)}
          label={locale.loading}
        />
      );
    case 'empty':
      return <EmptyBody span={span} />;
    case 'rows':
      return (
        <tbody className="tv-tbody" aria-busy={model.loading || undefined}>
          {rows.map((row) => (
            <BodyRow
              key={row.id}
              row={row}
              regions={regions}
              model={model}
              selected={row.getIsSelected()}
              sortKey={sortKey}
            />
          ))}
        </tbody>
      );
  }
}
