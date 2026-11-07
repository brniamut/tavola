import { version } from 'react';
import { version as domVersion } from 'react-dom';
import { expect, it } from 'vitest';

it('runs the suite on React 18', () => {
  expect(version).toMatch(/^18\./);
  expect(domVersion).toMatch(/^18\./);
});
