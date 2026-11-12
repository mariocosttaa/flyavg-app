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

test('admin entry boots and sends a guest to the portal login', async ({ page }) => {
  const errors = collectConsoleErrors(page);

  await page.goto('/admin/');
  await expect(page).toHaveURL('/login?redirect=/admin/');
  await expect(page.getByRole('heading', { level: 1, name: 'Iniciar sessão' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('admin deep link is served by the admin entry', async ({ page }) => {
  // The portal would show its NotFound; only the admin entry sends the path to the login.
  await page.goto('/admin/pilots?page=2');
  await expect(page).toHaveURL('/login?redirect=/admin/pilots%3Fpage%3D2');
});
