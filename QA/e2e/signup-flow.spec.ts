import { test, expect } from '@playwright/test';

test.describe('Signup Flow', () => {
    test('should complete signup and show success overlay', async ({ page }) => {
        // Mock signup API
        await page.route('**/api/auth/signup', async (route) => {
            await route.fulfill({
                status: 200,
                contentType: 'application/json',
                body: JSON.stringify({
                    user: { id: 'test-user-id', email: 'test@example.com', isAdmin: false, isPremium: false },
                    sessionId: 'test-session-id'
                }),
            });
        });

        await page.goto('/signup');

        // Fill the form
        await page.getByTestId('input-name').fill('Test User');
        await page.getByTestId('input-email').fill('test@example.com');
        await page.getByTestId('input-password').fill('Password123!');
        await page.getByTestId('input-confirm-password').fill('Password123!');

        // Select experience level
        await page.getByTestId('select-experience-level').click();
        await page.getByTestId('option-new-to-crypto').click();

        // Agree to updates
        await page.getByTestId('checkbox-agree-updates').click();

        // Submit
        await page.getByTestId('button-signup').click();

        // Verify success overlay
        const overlay = page.getByTestId('signup-success-overlay');
        await expect(overlay).toBeVisible();
        await expect(page.locator('text=Welcome to GOLDH!')).toBeVisible();

        // Verify redirection (wait for dashboard or URL change)
        await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
    });
});
