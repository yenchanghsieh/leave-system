import { test, expect } from '@playwright/test';

test.describe('Draft Management', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should create and delete a draft', async ({ page }) => {
        await test.step('Create Draft', async () => {
            await page.getByRole('button', { name: /New Request/i }).click();

            const today = new Date();
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + 45);
            const dateStr = futureDate.toISOString().split('T')[0];

            await page.locator('input[type="date"]').nth(0).fill(dateStr);
            await page.locator('input[type="date"]').nth(1).fill(dateStr);

            // Save Draft
            // Ensure visibility
            await expect(page.getByRole('button', { name: /Save Draft/i })).toBeVisible();
            await page.getByRole('button', { name: /Save Draft/i }).click();

            // Modal should close or show success
            // Logic: LeaveApplicationForm -> onSaveDraft -> onSuccess -> setOpen(false)
            // Check for closing
            await expect(page.getByRole('heading', { name: /New Request/i })).not.toBeVisible();
        });

        await test.step('Verify Draft in History', async () => {
            await page.getByRole('link', { name: /History/i }).click();

            // Try to find draft badge
            // "Draft" is the text
            await expect(page.getByText('Draft').first()).toBeVisible();
        });

        await test.step('Delete Draft', async () => {
            // Find the draft row. Filter by "Draft"
            const draftRow = page.locator('tr').filter({ hasText: 'Draft' }).first();
            await expect(draftRow).toBeVisible();

            await draftRow.getByRole('link', { name: /View/i }).click();

            // Check we are on details page
            await expect(page.getByText('Delete Draft')).toBeVisible();

            await page.getByRole('button', { name: /Delete Draft/i }).click();

            // Should redirect
            await expect(page).toHaveURL(/.*history/);
        });
    });
});
