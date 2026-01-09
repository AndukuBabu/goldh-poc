import { test, expect } from '@playwright/test';

test.describe('Exit Intent Popup', () => {
    test('should not appear on signup page', async ({ page }) => {
        await page.goto('/signup');

        // Attempt to trigger exit intent by moving mouse to top
        await page.mouse.move(100, 100);
        await page.mouse.move(100, 0);

        // Check if modal is visible
        const modal = page.locator('text=Before you go...');
        await expect(modal).not.toBeVisible();
    });

    test('should appear on landing page', async ({ page }) => {
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Trigger exit intent
        await page.mouse.move(100, 100);
        await page.mouse.move(100, 50); // Intermediate move to ensure tracking
        await page.mouse.move(100, 0);  // Final move to top

        // Dispatch mouseout with relatedTarget null to simulate leaving window
        await page.evaluate(() => {
            const event = new MouseEvent('mouseout', {
                bubbles: true,
                cancelable: true,
                clientY: 0,
                relatedTarget: null
            });
            document.dispatchEvent(event);
        });

        const modal = page.locator('text=Before you go...');
        await expect(modal).toBeVisible();
    });
});
