import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
    await page.goto('/');

    // Expect a title "to contain" a substring.
    // Adjust this based on your actual metadata title
    await expect(page).toHaveTitle(/Leave Management System/i);
});

test('homepage loads', async ({ page }) => {
    await page.goto('/');
    // Verify that the main element exists or something characteristic
    await expect(page.locator('body')).toBeVisible();
});
