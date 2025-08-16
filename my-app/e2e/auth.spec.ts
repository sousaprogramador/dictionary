import { test, expect } from '@playwright/test';

test('login redirects to home', async ({ page }) => {
  await page.goto('/login');
  await page.getByPlaceholder('email').fill('example@email.com');
  await page.getByPlaceholder('password').fill('test');
  await Promise.all([
    page.waitForURL('**/'),
    page.getByRole('button', { name: 'Enter' }).click(),
  ]);
  await expect(page).toHaveURL(/\/(\?q=.*)?$/);
});
