import { describe, expect, it } from 'vitest';

import { isEmptyFilter } from '../src/filters/is-empty-filter.ts';
import { matchesFilter } from '../src/filters/matches-filter.ts';
import { toText } from '../src/filters/to-text.ts';
import { defineColumns } from '../src/index.ts';
import { autoHiddenColumns } from '../src/layout/auto-hidden-columns.ts';
import { defaultLayout } from '../src/layout/default-layout.ts';
import type { TableLayout } from '../src/layout/layout.type.ts';
import { moveColumn } from '../src/layout/move-column.ts';
import { LAYOUT_VERSION, reconcileLayout } from '../src/layout/reconcile-layout.ts';
import { createStateHandlers } from '../src/table/create-state-handlers.ts';
import type { TableQuery } from '../src/table/table-query.type.ts';
import { applyPreset } from '../src/views/apply-preset.ts';
import { upsertView } from '../src/views/upsert-view.ts';
import { columns } from './fixtures.ts';

const defaults = defaultLayout(columns, { density: 'normal', pageSize: 25 });

describe('reconcileLayout', () => {
  it('ignores a layout of another storage version', () => {
    expect(reconcileLayout({ version: 999, order: ['email'] }, columns, defaults)).toBe(defaults);
  });

  it('drops columns that no longer exist and inserts new ones at their default place', () => {
    const stored = { version: LAYOUT_VERSION, order: ['email', 'removed', 'name', 'role'] };
    const { order } = reconcileLayout(stored, columns, defaults);
    expect(order).not.toContain('removed');
    expect(order.slice(0, 3)).toEqual(['email', 'name', 'role']);
    expect(order).toHaveLength(columns.length);
    // logins follows role in the default order, so it lands right after it.
    expect(order[order.indexOf('role') + 1]).toBe('logins');
  });

  it('clamps saved widths and drops widths of unknown columns', () => {
    const stored = { version: LAYOUT_VERSION, sizing: { email: 5, ghost: 300, logins: 200 } };
    const { sizing } = reconcileLayout(stored, columns, defaults);
    expect(sizing).toEqual({ email: 64, logins: 200 });
  });

  it('keeps only hidden columns that may be hidden, and pins that still exist', () => {
    const stored = {
      version: LAYOUT_VERSION,
      visibility: { email: false, ghost: false },
      pinning: { start: ['ghost', 'email'], end: [] },
    };
    const layout = reconcileLayout(stored, columns, defaults);
    expect(layout.visibility).toEqual({ email: false });
    expect(layout.pinning.start).toEqual(['email']);
  });

  it('falls back to defaults for an invalid density or page size', () => {
    const stored = { version: LAYOUT_VERSION, density: 'huge', pageSize: -1 } as never;
    const layout = reconcileLayout(stored, columns, defaults);
    expect(layout.density).toBe('normal');
    expect(layout.pageSize).toBe(25);
  });
});

describe('autoHiddenColumns', () => {
  const prioritised = defineColumns<{ a: string; b: string; c: string; d: string }>((col) => [
    col.text('a', { size: 100 }),
    col.text('b', { size: 100, priority: 1 }),
    col.text('c', { size: 100, priority: 2 }),
    col.text('d', { size: 100 }),
  ]);
  const layout = defaultLayout(prioritised, { density: 'normal', pageSize: 25 });

  it('hides nothing until the width is known or when everything fits', () => {
    expect(autoHiddenColumns(prioritised, layout, { width: null, extra: 0 }).size).toBe(0);
    expect(autoHiddenColumns(prioritised, layout, { width: 400, extra: 0 }).size).toBe(0);
  });

  it('hides the highest priority number first, then the next, never columns without one', () => {
    expect([...autoHiddenColumns(prioritised, layout, { width: 350, extra: 0 })]).toEqual(['c']);
    expect([...autoHiddenColumns(prioritised, layout, { width: 250, extra: 0 })]).toEqual([
      'c',
      'b',
    ]);
    expect([...autoHiddenColumns(prioritised, layout, { width: 50, extra: 0 })]).toEqual([
      'c',
      'b',
    ]);
  });

  it('leaves a column the user chose to show', () => {
    const shown = { ...layout, visibility: { c: true } };
    expect([...autoHiddenColumns(prioritised, shown, { width: 350, extra: 0 })]).toEqual(['b']);
  });
});

describe('moveColumn', () => {
  it('reorders visible columns and leaves hidden ones in place', () => {
    const layout = { ...defaults, order: ['a', 'hidden', 'b', 'c'] };
    const next = moveColumn(layout, 'center', { visible: ['a', 'b', 'c'], from: 2, to: 0 });
    expect(next.order).toEqual(['c', 'hidden', 'a', 'b']);
  });

  it('reorders within the pinned region only', () => {
    const layout = { ...defaults, pinning: { start: ['x', 'y'], end: [] } };
    const next = moveColumn(layout, 'start', { visible: ['x', 'y'], from: 0, to: 1 });
    expect(next.pinning.start).toEqual(['y', 'x']);
    expect(next.order).toBe(layout.order);
  });
});

describe('filters', () => {
  it('matches text case-insensitively and never matches missing values', () => {
    expect(matchesFilter('text', 'Ada Lovelace', 'love')).toBe(true);
    expect(matchesFilter('text', null, 'a')).toBe(false);
    expect(matchesFilter('text', 42, '4')).toBe(true);
  });

  it('matches open-ended number and date ranges', () => {
    expect(matchesFilter('number', 10, { min: 5 })).toBe(true);
    expect(matchesFilter('number', 10, { max: 5 })).toBe(false);
    expect(
      matchesFilter('date', '2026-03-02T10:00:00Z', { from: '2026-03-02', to: '2026-03-02' }),
    ).toBe(true);
    expect(matchesFilter('date', new Date(2026, 0, 1), { to: '2025-12-31' })).toBe(false);
  });

  it('treats empty filter values as no filter', () => {
    expect(isEmptyFilter('')).toBe(true);
    expect(isEmptyFilter([])).toBe(true);
    expect(isEmptyFilter({ min: undefined })).toBe(true);
    expect(isEmptyFilter({ min: 0 })).toBe(false);
    expect(isEmptyFilter(false)).toBe(false);
  });

  it('turns any value into text without [object Object]', () => {
    expect(toText({ a: 1 })).toBe('{"a":1}');
    expect(toText(null)).toBe('');
    expect(toText(new Date('invalid'))).toBe('');
  });
});

describe('createStateHandlers', () => {
  const setup = (): { get: () => TableQuery; handlers: ReturnType<typeof createStateHandlers> } => {
    let query: TableQuery = { sort: [], filters: {}, search: '', page: { index: 3, size: 25 } };
    const handlers = createStateHandlers({
      setQuery: (update) => {
        query = update(query);
      },
      setLayout: () => undefined,
      setRowSelection: () => undefined,
    });
    return { get: () => query, handlers };
  };

  it('goes back to the first page when sorting, filters or search change', () => {
    const { get, handlers } = setup();
    handlers.onSortingChange([{ id: 'name', desc: false }]);
    expect(get().page.index).toBe(0);
  });

  it('keeps the row actions column last when another column is pinned to the end', () => {
    let layout: TableLayout = { ...defaults, pinning: { start: [], end: ['actions'] } };
    const handlers = createStateHandlers({
      setQuery: () => undefined,
      setLayout: (update) => {
        layout = update(layout);
      },
      setRowSelection: () => undefined,
    });
    handlers.onColumnPinningChange((current) => ({ ...current, end: [...current.end, 'email'] }));
    expect(layout.pinning.end).toEqual(['email', 'actions']);
  });

  it('drops empty filters from the query', () => {
    const { get, handlers } = setup();
    handlers.onColumnFiltersChange([
      { id: 'name', value: '' },
      { id: 'role', value: ['admin'] },
    ]);
    expect(get().filters).toEqual({ role: ['admin'] });
  });
});

describe('saved views', () => {
  const specs = new Map(columns.map((spec) => [spec.id, spec]));
  const base = {
    order: columns.map((spec) => spec.id),
    visibility: {},
    pinning: { start: ['name'], end: [] },
    sizing: { email: 200 },
  };

  it('applies a preset in its order, skipping unknown and repeated ids', () => {
    const next = applyPreset(base, ['role', 'email', 'role', 'nope'], specs);
    expect(next.order.slice(0, 2)).toEqual(['role', 'email']);
    expect(next.visibility).toEqual({
      name: false,
      logins: false,
      createdAt: false,
      active: false,
      team: false,
    });
    expect(next.sizing).toEqual({ email: 200 });
  });

  it('replaces a view with the same name, ignoring case and accents', () => {
    const view = { name: 'Résumé', layout: base, query: { sort: [], filters: {}, search: '' } };
    const other = { ...view, name: 'Other' };
    const next = upsertView([view, other], { ...view, name: 'resume' });
    expect(next.map((saved) => saved.name)).toEqual(['resume', 'Other']);
    expect(upsertView([other], view).map((saved) => saved.name)).toEqual(['Other', 'Résumé']);
  });
});
