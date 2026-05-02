import { expect, test } from '@playwright/test';

test('can launch a new campaign from title screen', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'STELLAR REACH' })).toBeVisible();
  await page.getByLabel('Captain Name').fill('Captain QA');
  await page.getByRole('button', { name: 'Launch Campaign' }).click();

  await expect(page.getByRole('heading', { name: 'Market' })).toBeVisible();
  await expect(page.getByText('CR', { exact: true })).toBeVisible();
});

test('can navigate between gameplay tabs', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Launch Campaign' }).click();

  await page.getByRole('button', { name: 'Ship' }).click();
  await expect(page.getByRole('heading', { name: /Vessel:/ })).toBeVisible();

  await page.getByRole('button', { name: 'Crew' }).click();
  await expect(page.getByRole('heading', { name: /Active Crew/ })).toBeVisible();
});
