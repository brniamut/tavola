import type { ColumnSpec } from '../columns/column-spec.type.ts';
import type { Density, TableLayout } from './layout.type.ts';

/**
 * The layout the columns describe: their order, initial visibility, pins and no custom widths.
 * @param specs The columns in their default order.
 * @param options The default density and page size.
 * @returns The layout before the user changed anything.
 */
export function defaultLayout<TRow>(
  specs: readonly ColumnSpec<TRow>[],
  options: { density: Density; pageSize: number },
): TableLayout {
  return {
    order: specs.map((spec) => spec.id),
    visibility: Object.fromEntries(
      specs.filter((spec) => spec.settings.hidden).map((spec) => [spec.id, false]),
    ),
    pinning: {
      start: specs.filter((spec) => spec.settings.pin === 'start').map((spec) => spec.id),
      end: specs.filter((spec) => spec.settings.pin === 'end').map((spec) => spec.id),
    },
    sizing: {},
    density: options.density,
    pageSize: options.pageSize,
  };
}
