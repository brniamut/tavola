import type { SavedView } from './saved-view.type.ts';

/**
 * Adds a view, or replaces the one with the same name. Names match regardless of case and
 * accents, so "Overdue" replaces "overdue".
 * @param views The saved views.
 * @param view The view to save.
 * @returns The new list; a replaced view keeps its place.
 */
export function upsertView(views: readonly SavedView[], view: SavedView): SavedView[] {
  const collator = new Intl.Collator(undefined, { sensitivity: 'base' });
  const index = views.findIndex((existing) => collator.compare(existing.name, view.name) === 0);
  if (index === -1) return [...views, view];
  return views.map((existing, at) => (at === index ? view : existing));
}
