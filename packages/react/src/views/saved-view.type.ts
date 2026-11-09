import type { TableLayout } from '../layout/layout.type.ts';
import type { TableQuery } from '../table/table-query.type.ts';

/** The column arrangement a view or preset restores: order, visibility, pins and widths. */
export type ViewLayout = Pick<TableLayout, 'order' | 'visibility' | 'pinning' | 'sizing'>;

/** What a saved view restores of the query. Paging is left out: a view opens on the first page. */
export type ViewQuery = Pick<TableQuery, 'sort' | 'filters' | 'search'>;

/** A named view the user saved from the column picker: the columns plus filters, sort and search. */
export interface SavedView {
  /** The name the user gave it. Unique per table, ignoring case and accents. */
  name: string;
  /** The columns. */
  layout: ViewLayout;
  /** The filters, sort and search. */
  query: ViewQuery;
}

/** A set of columns you offer as a one-click choice in the column picker. */
export interface ColumnPreset {
  /** Button text, such as "Contact details". */
  label: string;
  /**
   * The column ids to show, in this order. Other columns are hidden, except those that may not be
   * hidden. Ids that do not exist are skipped.
   */
  columns: readonly string[];
}
