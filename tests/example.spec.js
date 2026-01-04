import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    await expect(page).toHaveTitle(/Event Solution Nepal/);
});

test('check navigation links', async ({ page }) => {
    await page.goto('/');

    // Check if Services link is visible
    await expect(page.getByRole('link', { name: 'Services', exact: true })).toBeVisible();
});
