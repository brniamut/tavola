import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react';
import { createPortal } from 'react-dom';

import { cx } from './cx.ts';
import type { PopoverProps } from './popover.type.ts';

/** Gap between the button and the panel, in pixels. */
const GAP_PX = 4;

const FOCUSABLE =
  'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]';

/**
 * Where the panel goes: below the button, lined up with its start or end edge. Fixed, so the
 * table's scroll container and sticky header cannot clip it.
 * @param trigger The button.
 * @param align Which edge to line up with.
 * @returns The panel position.
 */
function positionFor(trigger: HTMLElement, align: 'start' | 'end'): CSSProperties {
  const rect = trigger.getBoundingClientRect();
  const rtl = getComputedStyle(trigger).direction === 'rtl';
  const atLeft = (align === 'start') !== rtl;
  const top = rect.bottom + GAP_PX;
  return atLeft
    ? { position: 'fixed', top, left: rect.left }
    : { position: 'fixed', top, right: document.documentElement.clientWidth - rect.right };
}

/**
 * Moves focus between the panel's focusable elements with the arrow keys, as in a menu.
 * @param panel The panel element.
 * @param event The keydown event.
 */
function moveFocus(panel: HTMLElement, event: KeyboardEvent): void {
  if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
  const items = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
  const index = items.findIndex((item) => item === document.activeElement);
  const step = event.key === 'ArrowDown' ? 1 : -1;
  items.at((index + step) % items.length)?.focus();
  event.preventDefault();
}

/**
 * Closes the popover on Escape, a pointer down outside it, or scrolling outside it, and moves focus
 * with the arrow keys in menus.
 * @param panel The open panel.
 * @param options The trigger, whether the panel is a menu, and the close function.
 * @returns Removes the listeners.
 */
function listen(
  panel: HTMLElement,
  options: { trigger: HTMLElement | null; menu: boolean; close: (refocus: boolean) => void },
): () => void {
  const outside = (target: EventTarget | null): boolean =>
    target instanceof Node && !panel.contains(target) && !options.trigger?.contains(target);
  const onPointer = (event: PointerEvent): void => {
    if (outside(event.target)) options.close(false);
  };
  const onScroll = (event: Event): void => {
    if (outside(event.target)) options.close(false);
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      options.close(true);
    } else if (options.menu) moveFocus(panel, event);
  };
  document.addEventListener('pointerdown', onPointer);
  globalThis.addEventListener('scroll', onScroll, true);
  panel.addEventListener('keydown', onKey);
  return () => {
    document.removeEventListener('pointerdown', onPointer);
    globalThis.removeEventListener('scroll', onScroll, true);
    panel.removeEventListener('keydown', onKey);
  };
}

/**
 * A panel that opens below a button: menus, filters, the column picker. It closes on Escape, on
 * a click outside and on scroll, and gives focus back to the button when closed with Escape or
 * an action.
 * @param props The trigger, the content and how to present it.
 * @returns The trigger, and the panel while open.
 */
export function Popover({
  trigger,
  children,
  label,
  role = 'dialog',
  align = 'start',
  className,
}: PopoverProps): ReactElement {
  const [open, setOpen] = useState<{ style: CSSProperties; container: Element } | null>(null);
  // A callback ref in state, so render never reads a ref.
  const [button, setButton] = useState<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const close = useCallback(
    (refocus = true) => {
      setOpen(null);
      if (refocus) button?.focus();
    },
    [button],
  );
  const toggle = (): void => {
    if (open || !button) return setOpen(null);
    setOpen({
      style: positionFor(button, align),
      container: button.closest('.tv-root') ?? document.body,
    });
  };

  useEffect(() => {
    const panel = panelRef.current;
    if (!open || !panel) return;
    panel.querySelector<HTMLElement>(FOCUSABLE)?.focus();
    return listen(panel, { trigger: button, menu: role === 'menu', close });
  }, [open, role, close, button]);

  return (
    <>
      {trigger({
        ref: setButton,
        onClick: toggle,
        'aria-expanded': open !== null,
        'aria-haspopup': role,
        'aria-controls': open ? id : undefined,
      })}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            id={id}
            role={role}
            aria-label={label}
            className={cx('tv-popover', className)}
            style={open.style}
          >
            {children(() => close())}
          </div>,
          open.container,
        )}
    </>
  );
}
