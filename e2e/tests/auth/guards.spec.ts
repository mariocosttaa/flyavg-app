import { expect, test } from '@playwright/test';

// Guarded portal routes with the stub session (always a guest until sign-in exists).
test('pilot area sends a guest to the login with the way back', async ({ page }) => {
  await page.goto('/pilot');
  await expect(page).toHaveURL('/login?redirect=/pilot');
  await expect(page.getByRole('heading', { level: 1, name: 'Iniciar sessão' })).toBeVisible();
});

test('login page from the header link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Iniciar sessão' }).click();
  await expect(page).toHaveURL('/login');
  await expect(page.getByRole('textbox', { name: 'Email' })).toBeDisabled();
});
