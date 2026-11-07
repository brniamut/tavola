import type { ColumnKind } from '../columns/column-spec.type.ts';
import type { DateRangeFilter, NumberRangeFilter } from './filter-value.type.ts';
import { toText } from './to-text.ts';

/** Length of a `YYYY-MM-DD` day prefix of an ISO string. */
const ISO_DAY_LENGTH = 10;

/**
 * The calendar day of a value as `YYYY-MM-DD` in local time, or null when it is not a date.
 * @param value A Date or an ISO string.
 * @returns The day, or null.
 */
function toDay(value: unknown): string | null {
  if (value instanceof Date)
    return Number.isNaN(value.getTime())
      ? null
      : `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
  if (typeof value === 'string' && value.length >= ISO_DAY_LENGTH)
    return value.slice(0, ISO_DAY_LENGTH);
  return null;
}

/**
 * Whether a number lies within a range.
 * @param value The cell value.
 * @param range The filter.
 * @returns True when inside, or when the range is open on that side.
 */
function inNumberRange(value: unknown, range: NumberRangeFilter): boolean {
  if (typeof value !== 'number' || Number.isNaN(value)) return false;
  if (range.min !== undefined && value < range.min) return false;
  return range.max === undefined || value <= range.max;
}

/**
 * Whether a date lies within a range of days.
 * @param value The cell value.
 * @param range The filter.
 * @returns True when the day is inside the range.
 */
function inDateRange(value: unknown, range: DateRangeFilter): boolean {
  const day = toDay(value);
  if (day === null) return false;
  if (range.from && day < range.from) return false;
  return !range.to || day <= range.to;
}

/**
 * Whether a cell value passes a column filter. Null and undefined values never match a
 * filter, and never throw: a column of mixed or missing values is normal in admin data.
 * @param kind The column kind, which decides how the filter reads.
 * @param value The cell value.
 * @param filter The filter value for that column.
 * @returns True when the row should stay.
 */
export function matchesFilter(kind: ColumnKind, value: unknown, filter: unknown): boolean {
  if (value === null || value === undefined) return false;
  switch (kind) {
    case 'text':
      return toText(value).toLowerCase().includes(toText(filter).toLowerCase());
    case 'number':
      return inNumberRange(value, filter as NumberRangeFilter);
    case 'date':
      return inDateRange(value, filter as DateRangeFilter);
    case 'enum':
      return (filter as readonly unknown[]).includes(value);
    case 'boolean':
      return value === filter;
  }
}
