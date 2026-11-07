import type { ReactElement } from 'react';

import type { FilterEditorProps } from './filter-editor.type.ts';

/**
 * A text box: keeps rows whose value contains the text.
 * @param props The filter value and setter.
 * @returns The editor.
 */
export function TextFilter({
  value,
  onChange,
  spec,
  locale,
}: FilterEditorProps<string>): ReactElement {
  return (
    <input
      className="tv-input"
      type="search"
      aria-label={`${locale.filter} ${spec.header}`}
      placeholder={locale.filter}
      value={value ?? ''}
      onChange={(event) => onChange(event.target.value || undefined)}
    />
  );
}
