import type { ReactNode, Ref } from 'react';

/** Props to spread on the button that opens a popover. */
interface PopoverTriggerProps {
  ref: Ref<HTMLButtonElement>;
  onClick: () => void;
  'aria-expanded': boolean;
  'aria-haspopup': 'menu' | 'dialog';
  'aria-controls': string | undefined;
}

/** Props of `Popover`. */
export interface PopoverProps {
  /** Renders the button that opens the popover; spread the given props on it. */
  trigger: (props: PopoverTriggerProps) => ReactNode;
  /** The panel content; receives a function that closes the panel. */
  children: (close: () => void) => ReactNode;
  /** Accessible name of the panel. */
  label: string;
  /** `menu` for a list of actions, `dialog` for a form such as a filter. */
  role?: 'menu' | 'dialog';
  /** Which edge of the button the panel lines up with. */
  align?: 'start' | 'end';
  /** Extra class name on the panel. */
  className?: string | undefined;
}
