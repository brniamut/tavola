import { useEffect, useRef, type MouseEvent, type ReactElement } from 'react';

/**
 * A checkbox that can show the mixed state, for "some rows selected". Selection is changed on
 * click rather than change, so Shift-click reaches TanStack's range selection.
 * @param props Checked and mixed state, the click handler and an accessible label.
 * @returns The checkbox.
 */
export function Checkbox({
  checked,
  indeterminate = false,
  disabled = false,
  label,
  onClick,
}: {
  checked: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  label: string;
  onClick: (event: MouseEvent<HTMLInputElement>) => void;
}): ReactElement {
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate && !checked;
  }, [indeterminate, checked]);
  return (
    <input
      ref={ref}
      className="tv-checkbox"
      type="checkbox"
      aria-label={label}
      checked={checked}
      disabled={disabled}
      onClick={(event) => {
        event.stopPropagation();
        onClick(event);
      }}
      onChange={() => {
        // Handled on click, which carries the Shift key.
      }}
    />
  );
}
