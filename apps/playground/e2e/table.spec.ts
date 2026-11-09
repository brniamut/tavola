import { expect, test, type Locator, type Page } from '@playwright/test';

/** The header texts, in display order. */
async function headers(page: Page): Promise<string[]> {
  const texts = await page.locator('thead th').allInnerTexts();
  return texts.map((text) => text.trim()).filter(Boolean);
}

/** The body cell texts of the column with this header, found by name rather than position. */
async function columnTexts(page: Page, header: string): Promise<string[]> {
  const texts = await page.locator('thead th').allInnerTexts();
  const index = texts.findIndex((text) => text.trim() === header);
  if (index === -1) throw new Error(`No column "${header}"`);
  return page.locator(`tbody tr td:nth-child(${String(index + 1)})`).allInnerTexts();
}

/** The centre point of an element. */
async function centre(locator: Locator): Promise<{ x: number; y: number }> {
  const box = await locator.boundingBox();
  if (!box) throw new Error('Element is not visible');
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1600, height: 900 });
  await page.goto('/');
  await expect(page.getByRole('table', { name: 'Users' })).toBeVisible();
});

test('sorts by a column header and marks it with aria-sort', async ({ page }) => {
  await page.getByRole('button', { name: 'Logins', exact: true }).click();
  await expect(page.getByRole('columnheader', { name: /Logins/ })).toHaveAttribute(
    'aria-sort',
    'ascending',
  );
  const logins = (await columnTexts(page, 'Logins')).map(Number);
  expect(logins.length).toBeGreaterThan(1);
  expect(logins).toEqual(logins.toSorted((left, right) => left - right));
});

test('reorders columns by dragging the handle', async ({ page }) => {
  const handle = page.getByRole('button', { name: 'Move column Status' });
  const target = page.getByRole('columnheader', { name: /Logins/ });
  const from = await centre(handle);
  const to = await centre(target);
  // Drag the way a person does: press, start moving until the drag has visibly begun, travel,
  // settle over the target, release. Waiting for the floating copy keeps slow machines in step.
  await handle.hover();
  await page.mouse.down();
  await page.mouse.move(from.x + 12, from.y, { steps: 6 });
  await expect(page.locator('.tv-drag-overlay-label')).toBeVisible();
  await page.mouse.move(to.x, to.y, { steps: 40 });
  await page.mouse.move(to.x + 4, to.y, { steps: 4 });
  await page.waitForTimeout(250);
  await page.mouse.up();
  await expect.poll(() => headers(page)).toEqual(expect.arrayContaining(['Logins']));
  const order = await headers(page);
  expect(order.indexOf('Status')).toBeGreaterThan(order.indexOf('Logins'));
});

test('reorders columns with the keyboard', async ({ page }) => {
  const before = await headers(page);
  await page.getByRole('button', { name: 'Move column Status' }).focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Space');
  await expect
    .poll(async () => (await headers(page)).indexOf('Status'))
    .toBe(before.indexOf('Status') + 1);
});

test('resizes a column by dragging and with the arrow keys', async ({ page }) => {
  const header = page.getByRole('columnheader', { name: /Email/ });
  const grip = page.getByRole('button', { name: 'Resize column Email' });
  const start = (await header.boundingBox())?.width ?? 0;
  const at = await centre(grip);
  await page.mouse.move(at.x, at.y);
  await page.mouse.down();
  await page.mouse.move(at.x + 80, at.y, { steps: 10 });
  await page.mouse.up();
  await expect
    .poll(async () => (await header.boundingBox())?.width ?? 0)
    .toBeGreaterThan(start + 60);

  const dragged = (await header.boundingBox())?.width ?? 0;
  await grip.focus();
  await page.keyboard.press('ArrowRight');
  await expect
    .poll(async () => (await header.boundingBox())?.width ?? 0)
    .toBeGreaterThan(dragged + 10);
});

test('keeps a pinned column in place while scrolling sideways', async ({ page }) => {
  const nameCell = page.locator('tbody tr').first().locator('td').nth(1);
  const before = (await nameCell.boundingBox())?.x;
  await page.locator('.tv-scroller').evaluate((scroller) => scroller.scrollTo({ left: 400 }));
  await expect.poll(async () => (await nameCell.boundingBox())?.x).toBe(before);
});

test('filters from the header menu and shows the filter as a chip', async ({ page }) => {
  await page.getByRole('button', { name: 'Column options: Role' }).click();
  await page.getByRole('checkbox', { name: 'Admin' }).check();
  await page.keyboard.press('Escape');
  await expect(page.getByText('Role: Admin', { exact: true })).toBeVisible();
  expect(new Set(await columnTexts(page, 'Role'))).toEqual(new Set(['Admin']));
});

test('hides low-priority columns on a narrow screen and shows them again when wide', async ({
  page,
}) => {
  // All columns together are about 1550px wide; give them room first.
  await page.setViewportSize({ width: 1920, height: 900 });
  await expect.poll(() => headers(page)).toContain('Last seen');
  await page.setViewportSize({ width: 900, height: 900 });
  await expect.poll(() => headers(page)).not.toContain('Last seen');
  expect(await headers(page)).toContain('Name');
  await page.setViewportSize({ width: 1920, height: 900 });
  await expect.poll(() => headers(page)).toContain('Last seen');
});

test('keeps the server-mode query in the URL across a reload', async ({ page }) => {
  await page.getByRole('button', { name: 'Server, 5000 rows' }).click();
  await expect(page.getByText(/of 5000/)).toBeVisible();
  await page.getByRole('searchbox', { name: 'Search' }).fill('ada');
  await expect(page).toHaveURL(/users\.q=ada/);
  await page.reload();
  await expect(page.getByRole('searchbox', { name: 'Search' })).toHaveValue('ada');
  await expect(page.getByText(/of 5000/)).toHaveCount(0);
});

test('arranges columns in the column picker, applied only on Apply', async ({ page }) => {
  const open = async (): Promise<Locator> => {
    await page.getByRole('button', { name: 'Columns', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Choose columns' });
    await expect(dialog).toBeVisible();
    return dialog;
  };
  let dialog = await open();
  await dialog.getByRole('button', { name: 'Remove Email' }).click();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  expect(await headers(page)).toContain('Email');

  dialog = await open();
  await dialog.getByRole('button', { name: 'Remove Email' }).click();
  await expect(dialog.getByRole('button', { name: 'Add Email' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Add Country' }).click();
  await dialog.getByRole('button', { name: 'Move up Status' }).click();
  // Status is now first of the unpinned columns: its up arrow is disabled, so focus moves down.
  await expect(dialog.getByRole('button', { name: 'Move down Status' })).toBeFocused();
  await dialog.getByRole('button', { name: 'Apply' }).click();
  await expect(dialog).toBeHidden();
  const order = await headers(page);
  expect(order).not.toContain('Email');
  expect(order).toContain('Country');
  expect(order.indexOf('Status')).toBeLessThan(order.indexOf('Role'));
  await expect(page.getByRole('button', { name: 'Columns', exact: true })).toBeFocused();
});

test('drags columns in the column picker, with the mouse and the keyboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Columns', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Choose columns' })).toBeVisible();
  // CSS locators while a drag runs: Playwright's role queries crash its Firefox build mid-drag.
  const dialog = page.locator('dialog.tv-dialog');
  const names = (): Promise<string[]> =>
    dialog.locator('.tv-shown-list .tv-shown-row .tv-column-name').allInnerTexts();
  const row = (name: string): Locator =>
    dialog
      .locator('.tv-shown-row')
      .filter({ has: page.locator('.tv-column-name', { hasText: name }) });

  const from = await centre(row('Team').locator('.tv-shown-grip'));
  const to = await centre(row('Email'));
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(from.x, from.y - 12, { steps: 6 });
  await page.mouse.move(to.x, to.y - 8, { steps: 30 });
  await page.waitForTimeout(250);
  await page.mouse.up();
  await expect.poll(async () => (await names()).indexOf('Team')).toBe(1);
  // The drop animation keeps an empty placeholder in the list for a moment.
  await expect.poll(names).not.toContain('');

  // Space picks up, the arrows move, Space drops. Escape during a drag cancels only the drag.
  const before = await names();
  const grip = row('Role').locator('.tv-shown-grip');
  await grip.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(300);
  await expect(dialog).toHaveAttribute('open', '');
  await expect.poll(names).toEqual(before);
  await grip.focus();
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowUp');
  await page.keyboard.press('Space');
  await expect.poll(async () => (await names()).indexOf('Role')).toBe(before.indexOf('Role') - 1);
});
