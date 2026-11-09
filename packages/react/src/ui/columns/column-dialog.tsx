import { useEffect, useId, useRef, type ReactElement } from 'react';

import { ColumnEditor } from './column-editor.tsx';

/**
 * The column picker, in a native modal dialog: the browser traps focus and closes it on Escape.
 * Focus goes back to the button that opened it, also in browsers that do not focus a button on
 * click (Safari), where the dialog would have nothing to return to. The content mounts on open,
 * so every open starts a fresh draft from the current layout.
 * @param props The button that opened the dialog (null while closed), and a function that closes it.
 * @returns The dialog.
 */
export function ColumnDialog({
  opener,
  onClose,
}: {
  opener: HTMLElement | null;
  onClose: () => void;
}): ReactElement {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const open = opener !== null;
  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || !opener) return;
    dialog.showModal();
    dialog.querySelector<HTMLElement>('input[type="search"]')?.focus();
    return () => {
      // Close first: while the modal is open, the rest of the page cannot take focus.
      if (dialog.open) dialog.close();
      opener.focus();
    };
  }, [opener]);
  return (
    // A click on the backdrop lands on the dialog itself and closes it; Escape is native.
    // oxlint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className="tv-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => event.target === event.currentTarget && onClose()}
    >
      {open && <ColumnEditor titleId={titleId} onDone={onClose} />}
    </dialog>
  );
}
