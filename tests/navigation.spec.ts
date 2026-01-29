import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Helper to ensure we are on default user (Alex Chen)
        await expect(page.getByRole('button', { name: /Alex Chen/i })).toBeVisible();
    });

    test('should navigate to history page', async ({ page }) => {
        const historyLink = page.getByRole('link', { name: /History/i });
        await expect(historyLink).toBeVisible();
        await historyLink.click();

        // dictionary: history: 'My History'
        await expect(page).toHaveURL(/.*history/);
        await expect(page.getByRole('heading', { name: /My History/i })).toBeVisible();
    });

    test('should navigate to settings page', async ({ page }) => {
        const settingsLink = page.getByRole('link', { name: /Settings/i });
        await expect(settingsLink).toBeVisible();
        await settingsLink.click();

        await expect(page).toHaveURL(/.*settings/);
        await expect(page.getByRole('heading', { name: /Settings/i })).toBeVisible();
    });

    test('should highlight active link', async ({ page }) => {
        // Initially on Dashboard
        const dashboardLink = page.getByRole('link', { name: /Dashboard/i });
        // Check for aria-current="page"
        await expect(dashboardLink).toHaveAttribute('aria-current', 'page');

        // Navigate to History
        await page.getByRole('link', { name: /History/i }).click();
        const historyLink = page.getByRole('link', { name: /History/i });
        // Wait for navigation and state update
        await expect(historyLink).toHaveAttribute('aria-current', 'page');

        // Dashboard should no longer be active
        await expect(dashboardLink).not.toHaveAttribute('aria-current', 'page');
    });
});
