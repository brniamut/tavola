import { useId, type ReactElement } from 'react';

import type { Density } from '../../layout/layout.type.ts';
import { SELECT_COLUMN_ID } from '../../table/to-column-defs.ts';
import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { Popover } from '../common/popover.tsx';

const DENSITIES: readonly Density[] = ['compact', 'normal', 'comfortable'];

/**
 * A checkbox per column to show or hide it. Columns that may not be hidden are listed but locked.
 * @returns The fieldset.
 */
function ColumnToggles(): ReactElement {
  const { table, locale, specs } = useModel();
  const columns = table.getAllLeafColumns().filter((column) => column.id !== SELECT_COLUMN_ID);
  return (
    <fieldset className="tv-options">
      <legend className="tv-visually-hidden">{locale.columns}</legend>
      {columns.map((column) => (
        <label key={column.id} className="tv-check">
          <input
            type="checkbox"
            checked={column.getIsVisible()}
            disabled={!column.getCanHide()}
            onChange={column.getToggleVisibilityHandler()}
          />
          <span>{specs.get(column.id)?.header || column.id}</span>
        </label>
      ))}
    </fieldset>
  );
}

/**
 * Compact, normal or comfortable rows.
 * @returns The fieldset.
 */
function DensityPicker(): ReactElement {
  const { locale, layout, setLayout } = useModel();
  // Unique per table, so two tables on one page do not share a radio group.
  const name = useId();
  const labels = {
    compact: locale.densityCompact,
    normal: locale.densityNormal,
    comfortable: locale.densityComfortable,
  };
  return (
    <fieldset className="tv-segmented">
      <legend>{locale.density}</legend>
      {DENSITIES.map((density) => (
        <label key={density}>
          <input
            type="radio"
            name={name}
            checked={layout.density === density}
            onChange={() => setLayout((current) => ({ ...current, density }))}
          />
          <span>{labels[density]}</span>
        </label>
      ))}
    </fieldset>
  );
}

/**
 * The column picker: show or hide columns, choose the row density, and restore the default layout.
 * @returns The button and its panel.
 */
export function ViewMenu(): ReactElement {
  const { table, locale, resetLayout } = useModel();
  return (
    <Popover
      label={locale.columns}
      align="end"
      trigger={(props) => (
        <button {...props} type="button" className="tv-button">
          <Icon name="columns" />
          {locale.columns}
        </button>
      )}
    >
      {() => (
        <div className="tv-view-menu">
          <ColumnToggles />
          <DensityPicker />
          <div className="tv-view-actions">
            <button
              type="button"
              className="tv-link"
              onClick={() => table.toggleAllColumnsVisible(true)}
            >
              {locale.showAll}
            </button>
            <button type="button" className="tv-link" onClick={resetLayout}>
              {locale.resetLayout}
            </button>
          </div>
        </div>
      )}
    </Popover>
  );
}
