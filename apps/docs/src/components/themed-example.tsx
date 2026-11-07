import '@tavola/react/styles.css';

import { DataTable } from '@tavola/react';
import type { ReactElement } from 'react';

import { personColumns } from '../data/person-columns.ts';
import type { Person } from '../data/person.type.ts';
import { people } from '../data/people.ts';

/** Rows for the theming example. */
const ROWS = people(30);

/**
 * The row id.
 * @param person The row.
 * @returns Its id.
 */
const getRowId = (person: Person): string => person.id;

/**
 * The same table with a few CSS variables changed; see `.themed` in the docs stylesheet.
 * @returns The example.
 */
export function ThemedExample(): ReactElement {
  return (
    <div className="example themed">
      <DataTable
        label="People"
        columns={personColumns}
        data={ROWS}
        getRowId={getRowId}
        defaultDensity="compact"
        pageSizes={[10]}
      />
    </div>
  );
}
