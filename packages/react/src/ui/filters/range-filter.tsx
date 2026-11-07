import type { ReactElement } from 'react';

import type { DateRangeFilter, NumberRangeFilter } from '../../filters/filter-value.type.ts';
import type { FilterEditorProps } from './filter-editor.type.ts';

/**
 * Turns an input's text into a range bound, or undefined when empty.
 * @param text The input value.
 * @param numeric Whether the bound is a number.
 * @returns The bound.
 */
function toBound(text: string, numeric: boolean): string | number | undefined {
  if (text === '') return undefined;
  return numeric ? Number(text) : text;
}

/**
 * Two inputs for the lower and upper bound of a number or date column. Either may stay empty.
 * @param props The filter value and setter.
 * @returns The editor.
 */
export function RangeFilter({
  value,
  onChange,
  spec,
  locale,
}: FilterEditorProps<NumberRangeFilter | DateRangeFilter>): ReactElement {
  const numeric = spec.kind === 'number';
  const [lowKey, highKey] = numeric ? (['min', 'max'] as const) : (['from', 'to'] as const);
  const current = (value ?? {}) as Record<string, string | number | undefined>;
  const set = (key: string, text: string): void => {
    const next = { ...current, [key]: toBound(text, numeric) };
    const empty = next[lowKey] === undefined && next[highKey] === undefined;
    onChange(empty ? undefined : next);
  };
  return (
    <div className="tv-range">
      {[lowKey, highKey].map((key) => (
        <label key={key} className="tv-field">
          <span>{locale[key]}</span>
          <input
            className="tv-input"
            type={numeric ? 'number' : 'date'}
            value={current[key] ?? ''}
            onChange={(event) => set(key, event.target.value)}
          />
        </label>
      ))}
    </div>
  );
}
