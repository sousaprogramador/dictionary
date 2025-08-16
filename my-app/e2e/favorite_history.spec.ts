import { test, expect } from '@playwright/test';

test('favorite, unfavorite and history', async ({ page }) => {
  await page.goto('/?q=hello');
  const first = page.locator('a.card').first();
  const word = await first.innerText();
  await first.click();
  await page.getByRole('button', { name: 'Favorite' }).click();
  await page.goto('/favorites');
  await expect(page.locator(`text=${word}`)).toBeVisible();
  await page.goto(`/word/${encodeURIComponent(word)}`);
  await page.getByRole('button', { name: 'Unfavorite' }).click();
  await page.goto('/favorites');
  await expect(page.locator(`text=${word}`)).toHaveCount(0);
  await page.goto('/history');
  await expect(page.locator(`text=${word}`)).toBeVisible();
});
