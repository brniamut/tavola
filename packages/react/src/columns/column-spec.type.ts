import type { ReactNode } from 'react';

/** The kinds of data columns. The kind decides the filter editor, sorting and formatting. */
export type ColumnKind = 'text' | 'number' | 'date' | 'enum' | 'boolean';

/** Where a column sticks while the table scrolls horizontally. Logical, so it follows `dir`. */
export type ColumnPin = 'start' | 'end';

/** Horizontal alignment of a column's header and cells. */
export type ColumnAlign = 'start' | 'center' | 'end';

/** The keys of `TRow` whose value is assignable to `TValue` (optionally null or undefined). */
export type KeysOfType<TRow, TValue> = {
  [K in keyof TRow & string]-?: NonNullable<TRow[K]> extends TValue ? K : never;
}[keyof TRow & string];

/** What a custom cell renderer receives. */
export interface CellContext<TRow, TValue> {
  /** The column's value for this row. */
  value: TValue;
  /** The whole row. */
  row: TRow;
}

/** A class name, or a function that picks one per row. */
export type CellClassName<TRow> = string | ((row: TRow) => string | undefined);

/** Options every column accepts. */
export interface ColumnOptionsBase<TRow> {
  /** Header text, also used in the column picker and filter labels. Defaults to the key in words. */
  header?: string;
  /** Width in pixels. */
  size?: number;
  /** Smallest width in pixels the user can resize to. */
  minSize?: number;
  /** Largest width in pixels the user can resize to. */
  maxSize?: number;
  /** Stick the column to the start or end edge. The user can change this. */
  pin?: ColumnPin;
  /** Start hidden. The user can show it from the column picker. */
  hidden?: boolean;
  /** Whether the user may hide the column. Default true. */
  hideable?: boolean;
  /** Whether the user may drag the column to another position. Default true. */
  reorderable?: boolean;
  /** Whether the user may resize the column. Default true. */
  resizable?: boolean;
  /** Horizontal alignment. Numbers default to `end`, everything else to `start`. */
  align?: ColumnAlign;
  /** Extra class name on every body cell of this column. */
  className?: CellClassName<TRow>;
  /**
   * Hide this column automatically when the table is narrower than its columns. Higher numbers
   * hide first; columns without a priority never hide by themselves. The user can still show it
   * from the column picker.
   */
  priority?: number;
}

/** Options for a column that shows a field of the row. */
export interface DataColumnOptions<TRow, TValue> extends ColumnOptionsBase<TRow> {
  /** Render the cell yourself. The default formats the value by the column kind. */
  cell?: (context: CellContext<TRow, TValue>) => ReactNode;
  /** Whether the user may sort by this column. Default true. */
  sortable?: boolean;
  /** Whether the column has a filter. Default true. */
  filterable?: boolean;
  /** Whether the search box looks at this column. Default true for text and enum columns. */
  searchable?: boolean;
}

/** A choice in an enum column: a bare value, or a value with a label. */
export type EnumOption<TValue> = TValue | { value: TValue; label: string };

/** Options for an enum column: the values it can hold, in the order the filter lists them. */
export interface EnumColumnOptions<TRow, TValue> extends DataColumnOptions<TRow, TValue> {
  /** The possible values. Labels default to the value itself. */
  options: readonly EnumOption<TValue>[];
}

/** Options for a column that does not show a field, such as row actions or a computed value. */
export interface DisplayColumnOptions<TRow> extends ColumnOptionsBase<TRow> {
  /** Renders the cell. */
  cell: (row: TRow) => ReactNode;
}

/** An action in a row's menu. */
export interface RowAction {
  /** Text in the menu. */
  label: string;
  /** Runs when the user picks the action. */
  onSelect: () => void;
  /** Shown in a warning colour, for deletes and the like. */
  danger?: boolean;
  /** Shown but not selectable. */
  disabled?: boolean;
}

/** A column, as `defineColumns` returns it. Treat it as opaque: build it with the column helper. */
export interface ColumnSpec<TRow> {
  /** Unique id: the row key for data columns, the given id for display columns. */
  readonly id: string;
  /** Header text. */
  readonly header: string;
  /** The kind for data columns; `display` for the others. */
  readonly kind: ColumnKind | 'display';
  /** Reads the value from a row. Absent on display columns. */
  readonly accessor?: (row: TRow) => unknown;
  /** Renders a cell. */
  readonly render?: (row: TRow, value: unknown) => ReactNode;
  /** The row actions, on the actions column. */
  readonly actions?: (row: TRow) => readonly RowAction[];
  /** The choices of an enum column, normalised. */
  readonly options?: readonly { value: unknown; label: string }[];
  /** The options as given, with defaults applied. */
  readonly settings: Required<
    Pick<DataColumnOptions<TRow, unknown>, 'sortable' | 'filterable' | 'searchable'>
  > &
    Required<Pick<ColumnOptionsBase<TRow>, 'hideable' | 'reorderable' | 'resizable' | 'align'>> &
    Pick<
      ColumnOptionsBase<TRow>,
      'size' | 'minSize' | 'maxSize' | 'pin' | 'hidden' | 'className' | 'priority'
    >;
}
