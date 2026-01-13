import { test, expect } from '@playwright/test';

test.describe('Admin Health Dashboard', () => {
    test('should display scheduler status when logged in as admin', async ({ page }) => {
        // 1. Mock Auth (Admin User)
        await page.route('/api/user/me', async (route) => {
            await route.fulfill({
                json: {
                    id: 'mock-admin',
                    email: 'admin@test.com',
                    isAdmin: true,
                    name: 'Test Admin'
                }
            });
        });

        // 2. Mock Health API
        await page.route('/api/admin/health', async (route) => {
            await route.fulfill({
                json: {
                    status: "ready",
                    timestamp: new Date().toISOString(),
                    version: "1.2.0-test",
                    node_env: "test",
                    db: { status: "connected", userCount: 10 },
                    zoho: { status: "connected" },
                    data: {
                        umf: { cache_assets: 50, firestore_assets: 50 },
                        news: { total_entries: 100 },
                        events: { total_entries: 20 }
                    },
                    schedulers: {
                        umf: { enabled: true, status: "success", last_run_timestamp: "2023-01-01T10:00:00Z" },
                        news: { enabled: false, status: "stopped" }
                    },
                    secrets: {}
                }
            });
        });

        // 3. Mock Data Prefetchers (to prevent network errors)
        await page.route('/api/umf/snapshot', async (route) => route.fulfill({ json: { assets: [] } }));
        await page.route('/api/umf/movers', async (route) => route.fulfill({ json: [] }));
        await page.route('/api/guru-digest', async (route) => route.fulfill({ json: [] }));

        // 4. Navigate and Verify
        await page.goto('/admin/health');

        // Assert Scheduler UI
        // Expect "UMF Scheduler" to show "Enabled" or "Active"
        await expect(page.getByText('UMF Scheduler')).toBeVisible();
        await expect(page.getByText('Last run:')).toBeVisible();
        await expect(page.getByText('success')).toBeVisible(); // Status

        // Expect "News Scheduler" to show "Disabled" or "Stopped" (depending on UI implementation)
        // Adjust based on actual UI text. Usually "Stopped" or toggle unchecked.
    });
});
