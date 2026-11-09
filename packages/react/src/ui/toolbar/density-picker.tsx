import { useId, type ReactElement } from 'react';

import type { Density } from '../../layout/layout.type.ts';
import { useModel } from '../common/model-context.ts';

const DENSITIES: readonly Density[] = ['compact', 'normal', 'comfortable'];

/**
 * Compact, normal or comfortable rows. Applies at once.
 * @returns The fieldset.
 */
export function DensityPicker(): ReactElement {
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
