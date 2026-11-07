import type { TavolaModel } from '../../table/tavola-model.type.ts';

/** The parts of the model a row needs; passed as props so rows can skip rerendering. */
export interface RowModelProps<TRow> {
  /** Specs, formats, texts, class names and the row click handler. */
  model: Pick<TavolaModel<TRow>, 'specs' | 'formats' | 'locale' | 'classNames' | 'onRowClick'>;
}
