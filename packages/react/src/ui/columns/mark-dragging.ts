/**
 * Marks the dialog while a drag runs, so Escape cancels the drag and not the dialog. A drag handle
 * sets the mark on the key that picks it up, before dnd-kit reports the drag; the mark is removed
 * after the key that ended the drag has reached the dialog.
 * @param element An element inside the dialog.
 * @param dragging Whether a drag runs.
 */
export function markDragging(element: HTMLElement | null, dragging: boolean): void {
  const dialog = element?.closest('dialog');
  if (!dialog) return;
  if (dragging) dialog.dataset['dragging'] = '';
  else setTimeout(() => delete dialog.dataset['dragging'], 0);
}
