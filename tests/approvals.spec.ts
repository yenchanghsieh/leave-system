import { test, expect } from '@playwright/test';

test.describe('Manager Approvals', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should approve a pending request (via Substitute/Admin)', async ({ page }) => {
        const reasonText = `Approval Test ${Date.now()}`;

        await test.step('Submit Request as Employee', async () => {
            await expect(page.getByRole('button', { name: /Alex Chen/i })).toBeVisible();

            await page.getByRole('button', { name: /New Request/i }).click();

            const typeSelect = page.locator('select').nth(0);
            await typeSelect.selectOption('annual');

            const today = new Date();
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + 30);
            const dateStr = futureDate.toISOString().split('T')[0];

            await page.locator('input[type="date"]').nth(0).fill(dateStr);
            await page.locator('input[type="date"]').nth(1).fill(dateStr);

            const substituteTrigger = page.locator('button[role="combobox"]');
            await substituteTrigger.click();
            await page.getByRole('option', { name: /Sarah Manager/i }).click();

            await page.locator('textarea').fill(reasonText);
            await page.getByRole('button', { name: /Submit Request/i }).click();

            await expect(page.getByText('Application Submitted Successfully!')).toBeVisible();
            await expect(page.getByRole('heading', { name: /New Request/i })).not.toBeVisible();
        });

        await test.step('Switch to Admin (Substitute for Manager)', async () => {
            await page.getByRole('button', { name: /Alex Chen/i }).click();
            // Sarah Manager is on leave today (in mock data), so Admin covers approvals.
            await page.getByRole('menuitem', { name: /Admin User/i }).click();
            await expect(page.getByRole('button', { name: /Admin User/i })).toBeVisible();
        });

        await test.step('Approve Request', async () => {
            await page.getByRole('link', { name: /Approvals/i }).click();
            await expect(page.getByRole('heading', { name: /Pending Approvals/i })).toBeVisible();

            const requestCard = page.locator('div').filter({ hasText: reasonText }).last();
            await expect(requestCard).toBeVisible();

            await requestCard.getByRole('button', { name: /Approve/i }).click();

            await expect(requestCard).not.toBeVisible();
        });

        await test.step('Verify Status as Employee', async () => {
            await page.getByRole('button', { name: /Admin User/i }).click();
            await page.getByRole('menuitem', { name: /Alex Chen/i }).click();

            await page.getByRole('link', { name: /History/i }).click();

            const row = page.locator('tr').filter({ hasText: reasonText });
            await expect(row).toBeVisible();
            await expect(row).toContainText('Approved');
        });
    });
});
