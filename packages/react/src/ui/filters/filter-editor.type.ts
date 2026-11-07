import type { ColumnSpec } from '../../columns/column-spec.type.ts';
import type { Locale } from '../../locale/locale.type.ts';

/** Props of every filter editor. */
export interface FilterEditorProps<TValue> {
  /** The current filter, or undefined when none is set. */
  value: TValue | undefined;
  /** Sets the filter; undefined clears it. */
  onChange: (value: TValue | undefined) => void;
  /** The column being filtered. */
  spec: ColumnSpec<unknown>;
  /** Texts. */
  locale: Locale;
  /** How often each value occurs, for enum columns in client mode. */
  counts?: ReadonlyMap<unknown, number> | undefined;
}
