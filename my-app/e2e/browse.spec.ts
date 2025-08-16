import { test, expect } from '@playwright/test';

test('search and infinite list', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('search words').fill('fire');
  await Promise.all([
    page.waitForURL('**/?q=fire'),
    page.getByRole('button', { name: 'Search' }).click(),
  ]);
  const first = page.locator('a.card').first();
  await expect(first).toBeVisible();
  await page.mouse.wheel(0, 4000);
  await expect(
    page.locator('text=End').or(page.locator('text=Loading…'))
  ).toBeVisible();
});
