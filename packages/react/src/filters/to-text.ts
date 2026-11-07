/**
 * A cell value as text, for searching, filtering and display. Never `[object Object]`: dates
 * become ISO strings and other objects JSON, so a column holding an unexpected shape still shows
 * and matches something sensible.
 * @param value Any cell value.
 * @returns The text, or an empty string for null, undefined, symbols and functions.
 */
export function toText(value: unknown): string {
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint')
    return String(value);
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? '' : value.toISOString();
  if (typeof value === 'object' && value !== null) return JSON.stringify(value);
  return '';
}
