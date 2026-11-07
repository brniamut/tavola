import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { TavolaModel } from '../../table/tavola-model.type.ts';
import { formatValue } from '../body/format-value.ts';

/**
 * A short description of an active filter, for its chip: `Role: Admin, Editor`,
 * `Age: 18 - 65`, `Created: from 1 Jan 2026`.
 * @param spec The filtered column.
 * @param filter The filter value.
 * @param context Formats and texts.
 * @returns The description.
 */
export function describeFilter(
  spec: ColumnSpec<unknown>,
  filter: unknown,
  context: Pick<TavolaModel<unknown>, 'formats' | 'locale'>,
): string {
  const format = (value: unknown): string => formatValue(spec, value, context);
  if (Array.isArray(filter)) return `${spec.header}: ${filter.map(format).join(', ')}`;
  if (typeof filter === 'object' && filter !== null) {
    const { min, max, from, to } = filter as Record<string, unknown>;
    const low = min ?? from;
    const high = max ?? to;
    if (low !== undefined && high !== undefined)
      return `${spec.header}: ${format(low)} - ${format(high)}`;
    if (low !== undefined)
      return `${spec.header}: ${context.locale.from.toLowerCase()} ${format(low)}`;
    return `${spec.header}: ${context.locale.to.toLowerCase()} ${format(high)}`;
  }
  return `${spec.header}: ${format(filter)}`;
}
