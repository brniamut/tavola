import { useId, type ReactElement } from 'react';

import type { FilterEditorProps } from './filter-editor.type.ts';

/**
 * Any, yes or no.
 * @param props The filter value and setter.
 * @returns The editor.
 */
export function BooleanFilter({
  value,
  onChange,
  spec,
  locale,
}: FilterEditorProps<boolean>): ReactElement {
  // Unique per editor, so two tables on one page do not share a radio group.
  const name = useId();
  const choices = [
    { label: locale.any, value: undefined },
    { label: locale.yes, value: true },
    { label: locale.no, value: false },
  ];
  return (
    <fieldset className="tv-options">
      <legend className="tv-visually-hidden">{spec.header}</legend>
      {choices.map((choice) => (
        <label key={choice.label} className="tv-check">
          <input
            type="radio"
            name={name}
            checked={value === choice.value}
            onChange={() => onChange(choice.value)}
          />
          <span>{choice.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
