import type {
  ColumnSpec,
  DataColumnOptions,
  DisplayColumnOptions,
  EnumColumnOptions,
  KeysOfType,
  RowAction,
  ColumnOptionsBase,
} from './column-spec.type.ts';

/**
 * Builds columns for rows of type `TRow`. Each method only accepts keys whose value fits the
 * column kind, so `col.number('name')` is a type error when `name` is a string.
 */
export interface ColumnBuilder<TRow> {
  /**
   * A text column: contains-search filter, case-insensitive sorting.
   * @param key A key of the row holding a string.
   * @param options Header, size, renderer and behaviour.
   */
  text<K extends KeysOfType<TRow, string>>(
    key: K,
    options?: DataColumnOptions<TRow, TRow[K]>,
  ): ColumnSpec<TRow>;
  /**
   * A number column: min/max filter, numeric sorting, right-aligned.
   * @param key A key of the row holding a number.
   * @param options Header, size, renderer and behaviour.
   */
  number<K extends KeysOfType<TRow, number>>(
    key: K,
    options?: DataColumnOptions<TRow, TRow[K]>,
  ): ColumnSpec<TRow>;
  /**
   * A date column: from/to filter, chronological sorting. Accepts `Date` values and ISO strings.
   * @param key A key of the row holding a Date or an ISO date string.
   * @param options Header, size, renderer and behaviour.
   */
  date<K extends KeysOfType<TRow, Date | string>>(
    key: K,
    options?: DataColumnOptions<TRow, TRow[K]>,
  ): ColumnSpec<TRow>;
  /**
   * A column with a fixed set of values: a multi-select filter with counts.
   * @param key A key of the row.
   * @param options The possible values, plus header, size, renderer and behaviour.
   */
  enum<K extends keyof TRow & string>(
    key: K,
    options: EnumColumnOptions<TRow, NonNullable<TRow[K]>>,
  ): ColumnSpec<TRow>;
  /**
   * A yes/no column.
   * @param key A key of the row holding a boolean.
   * @param options Header, size, renderer and behaviour.
   */
  boolean<K extends KeysOfType<TRow, boolean>>(
    key: K,
    options?: DataColumnOptions<TRow, TRow[K]>,
  ): ColumnSpec<TRow>;
  /**
   * A column that renders something other than a single field: a combined value, a link, a badge.
   * @param id A unique column id.
   * @param options The cell renderer, plus header and size.
   */
  display(id: string, options: DisplayColumnOptions<TRow>): ColumnSpec<TRow>;
  /**
   * A menu of actions per row, pinned to the end.
   * @param getActions Returns the actions for a row.
   * @param options Header and size.
   */
  actions(
    getActions: (row: TRow) => readonly RowAction[],
    options?: Pick<ColumnOptionsBase<TRow>, 'header' | 'size'>,
  ): ColumnSpec<TRow>;
}
