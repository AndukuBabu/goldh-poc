import { test, expect } from '@playwright/test';

test.describe('Password Visibility Toggle', () => {
    test('should toggle password visibility', async ({ page }) => {
        await page.goto('/signup');

        const passwordInput = page.getByTestId('input-password');
        const toggleButton = page.getByTestId('toggle-password');

        // Initial state
        await expect(passwordInput).toHaveAttribute('type', 'password');

        // Click toggle
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        // Click toggle again
        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should toggle confirm password visibility', async ({ page }) => {
        await page.goto('/signup');

        const confirmPasswordInput = page.getByTestId('input-confirm-password');
        const toggleButton = page.getByTestId('toggle-confirm-password');

        // Initial state
        await expect(confirmPasswordInput).toHaveAttribute('type', 'password');

        // Click toggle
        await toggleButton.click();
        await expect(confirmPasswordInput).toHaveAttribute('type', 'text');

        // Click toggle again
        await toggleButton.click();
        await expect(confirmPasswordInput).toHaveAttribute('type', 'password');
    });
});
