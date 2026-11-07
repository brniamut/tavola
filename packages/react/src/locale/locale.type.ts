/** Every text the table shows. Pass a partial object to `locale` to translate or reword some. */
export interface Locale {
  /** Placeholder of the search box. */
  search: string;
  /** Button that opens the column picker. */
  columns: string;
  /** Column picker: restore the default layout. */
  resetLayout: string;
  /** Column picker: show every column. */
  showAll: string;
  /** Density menu label. */
  density: string;
  /** Density names. */
  densityCompact: string;
  densityNormal: string;
  densityComfortable: string;
  /** Header menu items. */
  sortAscending: string;
  sortDescending: string;
  clearSort: string;
  pinStart: string;
  pinEnd: string;
  unpin: string;
  hideColumn: string;
  /** Label of a header's menu button. */
  columnMenu: string;
  /** Label of a header's drag handle; the column header follows. */
  dragColumn: string;
  /** Label of the resize handle; the column header follows. */
  resizeColumn: string;
  /** Filter UI. */
  filter: string;
  clearFilter: string;
  clearAllFilters: string;
  /** Button in the "no matches" state that removes every filter and the search. */
  clearFilters: string;
  from: string;
  to: string;
  min: string;
  max: string;
  yes: string;
  no: string;
  any: string;
  /** Row selection. */
  selectRow: string;
  selectPage: string;
  /** The selection bar, given the number of selected rows. */
  selected: (count: number) => string;
  /** Offer to select every matching row, given their total (null when the server does not say). */
  selectAllMatching: (total: number | null) => string;
  /** Shown when every matching row is selected, given their total (null when unknown). */
  allMatchingSelected: (total: number | null) => string;
  clearSelection: string;
  /** Label of a row's action menu button. */
  rowActions: string;
  /** Pagination. */
  rowsPerPage: string;
  previousPage: string;
  nextPage: string;
  /** The range shown, such as `1-25 of 312`. */
  range: (first: number, last: number, total: number | null) => string;
  /** States. */
  loading: string;
  empty: string;
  noMatches: string;
  error: string;
  retry: string;
  /** Formats numbers and dates; a BCP 47 language tag. Defaults to the browser's language. */
  language?: string;
}
