/**
 * Whether a filter value filters nothing, so it can be dropped from state and the query. An
 * empty text, an empty selection and a range without bounds all count as empty.
 * @param filter A column filter value.
 * @returns True when the filter has no effect.
 */
export function isEmptyFilter(filter: unknown): boolean {
  if (filter === undefined || filter === null || filter === '') return true;
  if (Array.isArray(filter)) return filter.length === 0;
  if (typeof filter === 'object')
    return Object.values(filter).every((bound) => bound === undefined || bound === '');
  return false;
}
