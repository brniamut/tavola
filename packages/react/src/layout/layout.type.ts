/** Row height and padding. */
export type Density = 'compact' | 'normal' | 'comfortable';

/** The parts of the table the user arranges, and that Tavola remembers per table `id`. */
export interface TableLayout {
  /** Column ids in display order, pinned columns included. */
  order: string[];
  /** Hidden column ids map to false; absent means visible. */
  visibility: Record<string, boolean>;
  /** Column ids stuck to each edge, in order. */
  pinning: { start: string[]; end: string[] };
  /** Widths in pixels the user set by resizing. */
  sizing: Record<string, number>;
  /** Row density. */
  density: Density;
  /** Rows per page. */
  pageSize: number;
}

/** The layout as it is stored, with the version of the storage format. */
export interface StoredLayout extends Partial<TableLayout> {
  /** Storage format version. A layout with another version is ignored. */
  version: number;
}
