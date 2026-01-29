import { test, expect } from '@playwright/test';

test.describe('Leave Request', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
        // Check initial load
        await expect(page.getByRole('button', { name: /Alex Chen/i })).toBeVisible();
    });

    test('should open apply leave modal', async ({ page }) => {
        await page.getByRole('button', { name: /New Request/i }).click();
        await expect(page.getByRole('heading', { name: /New Request/i })).toBeVisible();
    });

    test('should submit a leave request', async ({ page }) => {
        // Open Modal
        await page.getByRole('button', { name: /New Request/i }).click();

        // 1. Leave Type (Default is Annual)
        // Use native select locator, first one is Type
        const typeSelect = page.locator('select').nth(0);
        await typeSelect.selectOption('annual');

        // 2. Dates
        // Native date inputs. 1st is Start, 2nd is End.
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        const dateStr = nextWeek.toISOString().split('T')[0];

        await page.locator('input[type="date"]').nth(0).fill(dateStr);
        await page.locator('input[type="date"]').nth(1).fill(dateStr);

        // 3. Substitute
        // Default might be "Sarah Manager" (Supervisor) or "Select a substitute..."
        // We target the trigger button specifically
        const substituteTrigger = page.locator('button[role="combobox"]');
        await expect(substituteTrigger).toBeVisible();

        // Check if we need to select (if empty or we want to ensure)
        // Let's just select "Sarah Manager" again or "Admin User" to be safe.
        await substituteTrigger.click();

        // Select "Sarah Manager" from the list (CommandItem)
        await page.getByRole('option', { name: /Sarah Manager/i }).click();

        // 4. Reason
        await page.locator('textarea').fill('Family vacation');

        // Submit
        await page.getByRole('button', { name: /Submit Request/i }).click();

        // Verify Success
        await expect(page.getByText('Application Submitted Successfully!')).toBeVisible();

        // Verify modal closes (wait for animation)
        await expect(page.getByRole('heading', { name: /New Request/i })).not.toBeVisible();
    });
});
