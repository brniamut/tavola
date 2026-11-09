import type { ReactElement } from 'react';

import { Icon } from '../common/icon.tsx';
import { useModel } from '../common/model-context.ts';
import { Popover } from '../common/popover.tsx';
import { DensityPicker } from './density-picker.tsx';

/**
 * An icon button that opens the row density choice.
 * @returns The button and its panel.
 */
export function DensityMenu(): ReactElement {
  const { locale } = useModel();
  return (
    <Popover
      label={locale.density}
      align="end"
      trigger={(props) => (
        <button
          {...props}
          type="button"
          className="tv-button tv-button-icon"
          aria-label={locale.density}
          title={locale.density}
        >
          <Icon name="density" />
        </button>
      )}
    >
      {() => <DensityPicker />}
    </Popover>
  );
}
