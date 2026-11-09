import type { ViewLayout, ViewQuery } from '../../views/saved-view.type.ts';

/** What the user is arranging in the column picker, applied only on "Apply". */
export interface ColumnDraft {
  /** The columns. */
  layout: ViewLayout;
  /** The query of the saved view that was loaded, applied with the columns; null keeps the query. */
  query: ViewQuery | null;
  /** The name to save the view under; empty to not save one. */
  name: string;
  /** The saved view picked from the list, or an empty string. */
  view: string;
}

/** A column as the picker lists it. */
export interface ColumnListRow {
  /** The column id. */
  id: string;
  /** The region it sits in; arrows move it only within that region. */
  region: 'start' | 'center' | 'end';
  /** Its index among the columns that can move in that region, or -1 when it cannot move. */
  index: number;
  /** The ids of the columns that can move in that region and match the search. */
  movable: readonly string[];
}
