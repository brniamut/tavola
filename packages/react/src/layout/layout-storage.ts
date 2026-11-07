import type { StoredLayout, TableLayout } from './layout.type.ts';
import { LAYOUT_VERSION } from './reconcile-layout.ts';

/**
 * The storage key of a table's layout.
 * @param id The table id.
 * @returns The localStorage key.
 */
function keyFor(id: string): string {
  return `tavola:${id}`;
}

/**
 * Reads and writes a table's layout in localStorage. Storage can be missing (server rendering),
 * full or blocked (private mode); then the table works without remembering its layout.
 * @param id The table id.
 * @returns Functions to read, write and clear the layout.
 */
export function layoutStorage(id: string): {
  read: () => StoredLayout | null;
  write: (layout: TableLayout) => void;
  clear: () => void;
} {
  return {
    read: () => {
      try {
        const raw = globalThis.localStorage?.getItem(keyFor(id));
        return raw ? (JSON.parse(raw) as StoredLayout) : null;
      } catch {
        return null;
      }
    },
    write: (layout) => {
      try {
        globalThis.localStorage?.setItem(
          keyFor(id),
          JSON.stringify({ version: LAYOUT_VERSION, ...layout }),
        );
      } catch {
        // Storage full or blocked: the layout is simply not remembered.
      }
    },
    clear: () => {
      try {
        globalThis.localStorage?.removeItem(keyFor(id));
      } catch {
        // Nothing stored that we can reach.
      }
    },
  };
}
