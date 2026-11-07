import type { Cell, Column, ColumnDef, Header, ReactTable, Row } from '@tanstack/react-table';

import type { features } from './features.ts';

/** The feature registry of every Tavola table. */
export type Features = typeof features;

/** A TanStack table instance as Tavola builds it: the escape hatch for advanced use. */
export type TanStackTable<TRow> = ReactTable<Features, TRow & object>;

/** A TanStack column of a Tavola table. */
export type TanStackColumn<TRow> = Column<Features, TRow & object>;

/** A TanStack header of a Tavola table. */
export type TanStackHeader<TRow> = Header<Features, TRow & object>;

/** A TanStack row of a Tavola table. */
export type TanStackRow<TRow> = Row<Features, TRow & object>;

/** A TanStack cell of a Tavola table. */
export type TanStackCell<TRow> = Cell<Features, TRow & object>;

/** A TanStack column definition of a Tavola table. */
export type TanStackColumnDef<TRow> = ColumnDef<Features, TRow & object>;
