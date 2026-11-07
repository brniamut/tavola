import type { ReactElement } from 'react';

import type { FilterEditorProps } from './filter-editor.type.ts';
import { BooleanFilter } from './boolean-filter.tsx';
import { EnumFilter } from './enum-filter.tsx';
import { RangeFilter } from './range-filter.tsx';
import { TextFilter } from './text-filter.tsx';

/**
 * The filter editor that fits the column's kind.
 * @param props The filter value and setter, and the column.
 * @returns The editor, or nothing for display columns.
 */
export function FilterEditor(props: FilterEditorProps<unknown>): ReactElement | null {
  switch (props.spec.kind) {
    case 'text':
      return <TextFilter {...(props as FilterEditorProps<string>)} />;
    case 'number':
    case 'date':
      return <RangeFilter {...(props as FilterEditorProps<object>)} />;
    case 'enum':
      return <EnumFilter {...(props as FilterEditorProps<readonly unknown[]>)} />;
    case 'boolean':
      return <BooleanFilter {...(props as FilterEditorProps<boolean>)} />;
    case 'display':
      return null;
  }
}
