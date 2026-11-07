/** Filter on a text column: rows whose value contains this text, ignoring case. */
export type TextFilter = string;

/** Filter on a number column: rows with a value between `min` and `max`, both inclusive. */
export interface NumberRangeFilter {
  /** Lowest value to keep. */
  min?: number;
  /** Highest value to keep. */
  max?: number;
}

/** Filter on a date column: rows on or between these days, as `YYYY-MM-DD`. */
export interface DateRangeFilter {
  /** First day to keep. */
  from?: string;
  /** Last day to keep. */
  to?: string;
}

/** Filter on an enum column: rows whose value is one of these. */
export type EnumFilter = readonly unknown[];

/** Filter on a boolean column. */
export type BooleanFilter = boolean;

/** Any column filter value. Which one a column uses follows from its kind. */
export type FilterValue =
  | TextFilter
  | NumberRangeFilter
  | DateRangeFilter
  | EnumFilter
  | BooleanFilter;
