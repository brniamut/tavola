/**
 * Turns a key such as `createdAt` or `last_login` into a header such as `Created at`, so a column
 * without an explicit header still reads well.
 * @param key The row key or column id.
 * @returns The key as words, first letter capitalised.
 */
export function humanize(key: string): string {
  const words = key
    .replaceAll(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replaceAll(/[_-]+/g, ' ')
    .trim()
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}
