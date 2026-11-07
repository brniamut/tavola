import type { OnChangeFn, RowSelectionState } from '@tanstack/react-table';
import { useCallback, useEffect, useState } from 'react';

import type { Selection } from './data-table-props.type.ts';
import type { TableQuery } from './table-query.type.ts';
import type { TanStackTable } from './tanstack.type.ts';

/**
 * Owns the selected row ids and the "select all matching" flag. Selection is keyed by row id, so
 * it survives sorting and paging. Changing filters or search clears "select all matching",
 * because "all" then means a different set of rows.
 * @param query The current query.
 * @returns The selected ids, their setter, the flag, and a builder for the selection object.
 */
export function useSelection<TRow>(query: TableQuery): {
  rows: RowSelectionState;
  setRows: OnChangeFn<RowSelectionState>;
  allMatching: boolean;
  setAllMatching: (value: boolean) => void;
  build: (table: TanStackTable<TRow>) => Selection<TRow>;
} {
  const [rows, setRows] = useState<RowSelectionState>({});
  const [allMatching, setAllMatching] = useState(false);
  const scope = JSON.stringify([query.filters, query.search]);
  // oxlint-disable-next-line react/exhaustive-deps -- `scope` is the dependency on purpose.
  useEffect(() => setAllMatching(false), [scope]);

  const build = useCallback(
    (table: TanStackTable<TRow>): Selection<TRow> => ({
      ids: Object.keys(rows).filter((id) => rows[id]),
      rows: table.getSelectedRowModel().rows.map((row) => row.original as TRow),
      allMatching,
      query,
      clear: () => {
        setRows({});
        setAllMatching(false);
      },
    }),
    [rows, allMatching, query],
  );

  return { rows, setRows, allMatching, setAllMatching, build };
}
