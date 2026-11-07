/**
 * A column id made safe for a CSS custom property name.
 * @param id The column id.
 * @returns The id with anything but letters, digits, `-` and `_` replaced.
 */
export function cssName(id: string): string {
  return id.replaceAll(/[^\w-]/g, '_');
}
