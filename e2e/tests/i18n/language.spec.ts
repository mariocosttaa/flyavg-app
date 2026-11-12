import { expect, test } from '@playwright/test';

// Language switch: strings and <html lang> change at once, and the choice survives a reload.
test('switching to English persists across reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('combobox', { name: 'Idioma' }).selectOption('en');

  await expect(page.getByRole('link', { name: 'Sign in' })).toBeVisible();
  await expect(page.getByText('Under construction')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');

  await page.reload();

  await expect(page.getByRole('combobox', { name: 'Language' })).toHaveValue('en');
  await expect(page.getByText('Under construction')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en-GB');
});
