import '@tavola/react/styles.css';

import { DataTable } from '@tavola/react';
import type { ReactElement } from 'react';

import { personColumns } from '../data/person-columns.ts';
import type { Person } from '../data/person.type.ts';
import { people } from '../data/people.ts';

/** Rows for the client-mode example. */
const ROWS = people(120);

/**
 * The row id.
 * @param person The row.
 * @returns Its id.
 */
const getRowId = (person: Person): string => person.id;

/**
 * A complete client-mode table: rows in memory, everything else is the default.
 * @returns The example.
 */
export function ClientExample(): ReactElement {
  return (
    <div className="example">
      <DataTable
        id="docs-client"
        label="People"
        columns={personColumns}
        data={ROWS}
        getRowId={getRowId}
        bulkActions={[
          {
            label: 'Export',
            onAction: (selection) => alert(`Export ${String(selection.ids.length)} rows`),
          },
        ]}
      />
    </div>
  );
}
