import type { ReactElement } from 'react';

import type { FilterEditorProps } from './filter-editor.type.ts';

/**
 * A checkbox per option, with how many rows have it when that is known.
 * @param props The filter value and setter.
 * @returns The editor.
 */
export function EnumFilter({
  value,
  onChange,
  spec,
  counts,
}: FilterEditorProps<readonly unknown[]>): ReactElement {
  const selected = value ?? [];
  const toggle = (option: unknown): void => {
    const next = selected.includes(option)
      ? selected.filter((item) => item !== option)
      : [...selected, option];
    onChange(next.length ? next : undefined);
  };
  return (
    <fieldset className="tv-options">
      <legend className="tv-visually-hidden">{spec.header}</legend>
      {(spec.options ?? []).map((option) => (
        <label key={String(option.value)} className="tv-check">
          <input
            type="checkbox"
            checked={selected.includes(option.value)}
            onChange={() => toggle(option.value)}
          />
          <span>{option.label}</span>
          {counts && <span className="tv-count">{counts.get(option.value) ?? 0}</span>}
        </label>
      ))}
    </fieldset>
  );
}
