import type { SavedView } from './saved-view.type.ts';

/** The current storage format of saved views. */
const VIEWS_VERSION = 1;

/**
 * Whether a stored value looks like a saved view. Views are reconciled with the columns when
 * loaded, so only the outline is checked here.
 * @param value A stored entry.
 * @returns True for an object with a name, a layout and a query.
 */
function isView(value: unknown): value is SavedView {
  if (typeof value !== 'object' || value === null) return false;
  const { name, layout, query } = value as Record<string, unknown>;
  return typeof name === 'string' && typeof layout === 'object' && typeof query === 'object';
}

/**
 * Reads and writes a table's saved views in localStorage, next to its layout. Storage can be
 * missing, full or blocked; then views last until the page reloads.
 * @param id The table id.
 * @returns Functions to read and write the views.
 */
export function viewStorage(id: string): {
  read: () => SavedView[];
  write: (views: readonly SavedView[]) => void;
} {
  const key = `tavola:${id}:views`;
  return {
    read: () => {
      try {
        const raw = globalThis.localStorage?.getItem(key);
        const stored = raw ? (JSON.parse(raw) as { version?: unknown; views?: unknown }) : null;
        if (stored?.version !== VIEWS_VERSION || !Array.isArray(stored.views)) return [];
        return stored.views.filter(isView);
      } catch {
        return [];
      }
    },
    write: (views) => {
      try {
        globalThis.localStorage?.setItem(key, JSON.stringify({ version: VIEWS_VERSION, views }));
      } catch {
        // Storage full or blocked: the views are simply not remembered.
      }
    },
  };
}
