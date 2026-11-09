import type { ReactElement } from 'react';

import { applyPreset } from '../../views/apply-preset.ts';
import type { ViewLayout } from '../../views/saved-view.type.ts';
import { useModel } from '../common/model-context.ts';

/**
 * One button per column preset, plus one that shows every column.
 * @param props The draft columns and a function that receives the columns of the chosen preset.
 * @returns The group of buttons.
 */
export function PresetButtons({
  layout,
  onPick,
}: {
  layout: ViewLayout;
  onPick: (layout: ViewLayout) => void;
}): ReactElement {
  const { presets, specs, locale } = useModel();
  return (
    <fieldset className="tv-presets">
      <legend className="tv-visually-hidden">{locale.presets}</legend>
      {presets.map((preset) => (
        <button
          key={preset.label}
          type="button"
          className="tv-preset"
          onClick={() => onPick(applyPreset(layout, preset.columns, specs))}
        >
          {preset.label}
        </button>
      ))}
      <button
        type="button"
        className="tv-preset"
        onClick={() => onPick({ ...layout, visibility: {} })}
      >
        {locale.showAll}
      </button>
    </fieldset>
  );
}
