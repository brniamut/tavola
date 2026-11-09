import type { ReactElement } from 'react';

/** Paths of the icons, drawn on a 16 by 16 grid with a 1.5 stroke. */
const PATHS = {
  sortAsc: 'M8 3v10M4 7l4-4 4 4',
  sortDesc: 'M8 3v10M4 9l4 4 4-4',
  sortable: 'M5 6l3-3 3 3M5 10l3 3 3-3',
  grip: 'M6 4h.01M10 4h.01M6 8h.01M10 8h.01M6 12h.01M10 12h.01',
  more: 'M4 8h.01M8 8h.01M12 8h.01',
  columns: 'M2.5 3h11v10h-11zM6.5 3v10M9.5 3v10',
  search: 'M7 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM14 14l-3.5-3.5',
  close: 'M4 4l8 8M12 4l-8 8',
  filter: 'M2.5 3.5h11l-4.25 5v4l-2.5 1v-5z',
  chevronLeft: 'M10 3L5 8l5 5',
  chevronRight: 'M6 3l5 5-5 5',
  chevronUp: 'M3 10l5-5 5 5',
  chevronDown: 'M3 6l5 5 5-5',
  density: 'M2.5 4h11M2.5 8h11M2.5 12h11',
  plus: 'M8 3v10M3 8h10',
  trash: 'M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5',
  pin: 'M8 10v4M5 2.5h6M6 2.5v4l-2 3h8l-2-3v-4',
  table: 'M2.5 3.5h11v9h-11zM2.5 6.5h11M6.5 6.5v6',
  alert: 'M8 14.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13zM8 5v3.5M8 11h.01',
} as const;

/**
 * A small inline icon. Decorative: the button around it carries the accessible label.
 * @param props The icon name.
 * @returns The SVG.
 */
export function Icon({ name }: { name: keyof typeof PATHS }): ReactElement {
  return (
    <svg className="tv-icon" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
      <path d={PATHS[name]} />
    </svg>
  );
}
