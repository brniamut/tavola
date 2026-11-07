import '@tavola/react/styles.css';

import { DataTable } from '@tavola/react';
import type { ReactElement } from 'react';

import { personColumns } from '../data/person-columns.ts';
import type { Person } from '../data/person.type.ts';
import { fetchPeople } from '../data/fetch-people.ts';

/**
 * The row id.
 * @param person The row.
 * @returns Its id.
 */
const getRowId = (person: Person): string => person.id;

/**
 * A server-mode table against a pretend API with 1000 rows and a short delay.
 * @returns The example.
 */
export function ServerExample(): ReactElement {
  return (
    <div className="example">
      <DataTable
        label="People"
        columns={personColumns}
        fetcher={fetchPeople}
        getRowId={getRowId}
        pageSizes={[10, 25]}
      />
    </div>
  );
}
