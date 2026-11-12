import { expect, test, type Page } from '@playwright/test';

// Catalog entry (built because e2e uses VITE_APP_ENV=development): boots without console
// errors, serves the self-hosted fonts and re-themes the page live from its controls.
const fontResponse = (page: Page, file: string) =>
  page.waitForResponse((response) => response.url().includes(file));

test('catalog switches airline and mode live', async ({ page }) => {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));

  const soraFont = fontResponse(page, 'Sora-');
  const monoFont = fontResponse(page, 'JetBrainsMono-500');

  await page.goto('/catalog/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Catálogo do design system' }),
  ).toBeVisible();
  expect((await soraFont).ok()).toBe(true);
  expect((await monoFont).ok()).toBe(true);

  const html = page.locator('html');
  const body = page.locator('body');

  await page.getByRole('radio', { name: 'Grupo' }).check();
  await page.getByRole('radio', { name: 'Claro' }).check();
  // Areia, the group light surface.
  await expect(body).toHaveCSS('background-color', 'rgb(250, 246, 238)');

  // Kufam is only requested once a TAAG Virtual display heading needs it.
  const kufamFont = fontResponse(page, 'Kufam-var');

  await page.getByRole('radio', { name: 'TAAG Virtual' }).check();
  await page.getByRole('radio', { name: 'Escuro' }).check();
  await expect(html).toHaveAttribute('data-airline', 'taag');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  // TAAG Virtual warm dark brown.
  await expect(body).toHaveCSS('background-color', 'rgb(30, 25, 25)');
  expect((await kufamFont).ok()).toBe(true);
  expect(errors).toEqual([]);
});
