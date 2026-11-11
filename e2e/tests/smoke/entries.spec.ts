import { expect, test, type Page } from '@playwright/test';

// Smoke: both HTML entries boot, render their translated pages and log no console errors
// (a CSP block or a failed env validation would surface here).
function collectConsoleErrors(page: Page): string[] {
  const errors: string[] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      errors.push(message.text());
    }
  });
  page.on('pageerror', (error) => errors.push(error.message));

  return errors;
}

test('portal home renders', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: 'FlyAVG' })).toBeVisible();
  await expect(page.getByText('Em construção')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'pt-PT');
  await expect(page.locator('html')).toHaveAttribute('data-theme', /^(light|dark)$/);
  expect(errors).toEqual([]);
});

test('admin entry renders its dashboard', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  await page.goto('/admin/');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Painel de administração' }),
  ).toBeVisible();
  await expect(page).toHaveTitle(/FlyAVG/);
  expect(errors).toEqual([]);
});

test('admin deep link is served by the admin entry', async ({ page }) => {
  // An unknown admin path must boot admin (its NotFound inside the admin frame), not the portal.
  await page.goto('/admin/does-not-exist');
  await expect(page.getByText('FlyAVG Admin')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Página não encontrada' })).toBeVisible();
});
