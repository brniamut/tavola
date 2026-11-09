import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

// jsdom has <dialog> but not its modal methods.
if (!('showModal' in HTMLDialogElement.prototype)) {
  Object.assign(HTMLDialogElement.prototype, {
    showModal(this: HTMLDialogElement) {
      this.open = true;
    },
    close(this: HTMLDialogElement) {
      this.open = false;
      this.dispatchEvent(new Event('close'));
    },
  });
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});
