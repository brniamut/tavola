import { createContext, useContext } from 'react';

import type { TavolaModel } from '../../table/tavola-model.type.ts';

/** Shares the table model with its parts. */
export const ModelContext = createContext<TavolaModel<unknown> | null>(null);

/**
 * Reads the table model. Only for parts rendered inside `<DataTable>`.
 * @returns The model.
 */
export function useModel<TRow = unknown>(): TavolaModel<TRow> {
  const model = useContext(ModelContext);
  if (!model) throw new Error('Tavola: a table part was rendered outside <DataTable>.');
  return model as unknown as TavolaModel<TRow>;
}
