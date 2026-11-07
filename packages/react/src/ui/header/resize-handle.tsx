import type { KeyboardEvent, ReactElement } from 'react';

import type { TanStackHeader, TanStackTable } from '../../table/tanstack.type.ts';

/** How far one arrow key press resizes a column, in pixels. */
const KEYBOARD_STEP_PX = 16;

/**
 * The grip on a header's edge to resize the column: drag with mouse or touch, left and right
 * arrow keys when focused, double-click to restore the default width. A button, so keyboard and
 * screen reader users can reach it.
 * @param props The header, the table and the accessible label.
 * @returns The handle.
 */
export function ResizeHandle<TRow>({
  header,
  table,
  label,
}: {
  header: TanStackHeader<TRow>;
  table: TanStackTable<TRow>;
  label: string;
}): ReactElement {
  const { column } = header;
  const resize = header.getResizeHandler();
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>): void => {
    const step = { ArrowLeft: -KEYBOARD_STEP_PX, ArrowRight: KEYBOARD_STEP_PX }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    const rtl = getComputedStyle(event.currentTarget).direction === 'rtl';
    const { minSize = 0, maxSize = Number.POSITIVE_INFINITY } = column.columnDef;
    const size = Math.min(maxSize, Math.max(minSize, column.getSize() + (rtl ? -step : step)));
    table.setColumnSizing((current) => ({ ...current, [column.id]: size }));
  };
  return (
    <button
      type="button"
      className="tv-resizer"
      aria-label={label}
      data-resizing={column.getIsResizing() || undefined}
      onMouseDown={resize}
      onTouchStart={resize}
      onDoubleClick={() => column.resetSize()}
      onKeyDown={onKeyDown}
      onClick={(event) => event.stopPropagation()}
    />
  );
}
