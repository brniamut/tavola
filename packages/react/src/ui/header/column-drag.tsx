import { DragDropProvider, DragOverlay } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import type { ReactElement, ReactNode } from 'react';

import { moveColumn } from '../../layout/move-column.ts';
import { SELECT_COLUMN_ID } from '../../table/to-column-defs.ts';
import { columnRegions } from '../common/column-regions.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';

/**
 * Drag and drop for column headers. While a header is dragged, a floating copy follows the
 * pointer and the header row keeps its shape: lifting the real cell out of the row makes Firefox
 * and WebKit shift every later column, so the drop would land one column off. A drop writes the
 * new order to the layout, which TanStack and storage then follow.
 * @param props The table, which holds the draggable headers.
 * @returns The provider around the table, and the floating copy next to it.
 */
export function ColumnDrag({ children }: { children: ReactNode }): ReactElement {
  const model = useModel();
  const visibleIds = (region: 'start' | 'center' | 'end'): string[] => {
    const columns = columnRegions(model.table)[region];
    return columns.map((column) => column.id).filter((id) => id !== SELECT_COLUMN_ID);
  };

  return (
    <DragDropProvider
      onDragEnd={(event) => {
        const { source } = event.operation;
        if (event.canceled || !isSortable(source)) return;
        const region = source.group as 'start' | 'center' | 'end';
        const move = { visible: visibleIds(region), from: source.initialIndex, to: source.index };
        model.setLayout((layout) => moveColumn(layout, region, move));
      }}
    >
      {children}
      <DragOverlay className="tv-drag-overlay" dropAnimation={null}>
        {(source) => (
          <span className="tv-drag-overlay-label">
            <Icon name="grip" />
            {model.specs.get(String(source.id))?.header}
          </span>
        )}
      </DragOverlay>
    </DragDropProvider>
  );
}
