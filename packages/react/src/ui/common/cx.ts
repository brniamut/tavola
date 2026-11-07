/**
 * Joins class names, skipping empty ones.
 * @param names Class names, or falsy values to skip.
 * @returns The joined class attribute.
 */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
