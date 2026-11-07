import type { ColumnKind, ColumnSpec } from '../../columns/column-spec.type.ts';
import { toText } from '../../filters/to-text.ts';
import type { TavolaModel } from '../../table/tavola-model.type.ts';

/** How each kind turns a present value into text. */
const FORMATTERS: Record<
  ColumnKind | 'display',
  (
    value: unknown,
    spec: ColumnSpec<unknown>,
    context: Pick<TavolaModel<unknown>, 'formats' | 'locale'>,
  ) => string
> = {
  text: toText,
  display: toText,
  number: (value, _spec, context) =>
    typeof value === 'number' ? context.formats.number.format(value) : toText(value),
  date: (value, _spec, context) => {
    const date = value instanceof Date ? value : new Date(toText(value));
    return Number.isNaN(date.getTime()) ? toText(value) : context.formats.date.format(date);
  },
  boolean: (value, _spec, context) => (value ? context.locale.yes : context.locale.no),
  enum: (value, spec) =>
    spec.options?.find((option) => option.value === value)?.label ?? toText(value),
};

/**
 * Formats a cell value by its column kind, in the table's language. Missing values render as an
 * empty string; a value of the wrong type renders as text rather than throwing.
 * @param spec The column.
 * @param value The cell value.
 * @param context Number and date formats, and the yes/no texts.
 * @returns The text to show.
 */
export function formatValue(
  spec: ColumnSpec<unknown>,
  value: unknown,
  context: Pick<TavolaModel<unknown>, 'formats' | 'locale'>,
): string {
  if (value === null || value === undefined || value === '') return '';
  return FORMATTERS[spec.kind](value, spec, context);
}
