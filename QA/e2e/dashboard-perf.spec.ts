import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test.describe('Dashboard Performance Benchmarks', () => {
    // Disable parallel execution
    test.describe.configure({ mode: 'serial' });

    const resultsPath = path.join(process.cwd(), 'QA', 'perf-results.json');

    test('New User First Dashboard Load', async ({ page }) => {
        console.log('--- START: New User Performance Test ---');
        const uniqueEmail = `perf-test-${Date.now()}@example.com`;

        await page.goto('/signup');
        await page.fill('[data-testid="input-name"]', 'Perf Test');
        await page.fill('[data-testid="input-email"]', uniqueEmail);
        await page.fill('[data-testid="input-password"]', 'Password123!');
        await page.fill('[data-testid="input-confirm-password"]', 'Password123!');
        await page.fill('[data-testid="input-phone"]', '1234567890');

        // Handle Radix UI Select
        await page.click('[data-testid="select-experience-level"]');
        await page.click('[data-testid="option-crypto-enthusiast"]');

        await page.click('[data-testid="checkbox-agree-updates"]');
        await page.click('[data-testid="button-signup"]');

        await page.waitForSelector('[data-testid="signup-success-overlay"]', { timeout: 30000 });

        const navigationStart = Date.now();
        await page.waitForURL('**/dashboard', { timeout: 30000 });

        const dataStart = Date.now();
        await page.waitForSelector('text=Market Overview', { timeout: 20000 });

        const firstAssetCard = page.locator('[data-testid^="card-asset-"]').first();
        await firstAssetCard.waitFor({ state: 'visible', timeout: 90000 });

        const dataEnd = Date.now();

        const totalDuration = dataEnd - navigationStart;
        const dataLoadDuration = dataEnd - dataStart;

        const results = {
            newUser: {
                totalDuration,
                dataLoadDuration,
                timestamp: new Date().toISOString()
            }
        };

        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
        console.log(`NEW USER DATA LOAD DURATION: ${dataLoadDuration}ms`);
    });

    test('Returning User Dashboard Load', async ({ page }) => {
        console.log('--- START: Returning User Performance Test ---');
        const uniqueEmail = `returning-test-${Date.now()}@example.com`;

        await page.goto('/signup');
        await page.fill('[data-testid="input-name"]', 'Returning Test');
        await page.fill('[data-testid="input-email"]', uniqueEmail);
        await page.fill('[data-testid="input-password"]', 'Password123!');
        await page.fill('[data-testid="input-confirm-password"]', 'Password123!');
        await page.fill('[data-testid="input-phone"]', '1234567890');

        // Handle Radix UI Select
        await page.click('[data-testid="select-experience-level"]');
        await page.click('[data-testid="option-crypto-enthusiast"]');

        await page.click('[data-testid="checkbox-agree-updates"]');
        await page.click('[data-testid="button-signup"]');

        await page.waitForURL('**/dashboard', { timeout: 30000 });
        await page.waitForSelector('[data-testid^="card-asset-"]', { timeout: 90000 });

        await page.click('[data-testid="button-nav-signout"]');
        await page.waitForURL('**/', { timeout: 20000 });

        await page.goto('/signin');
        await page.fill('[data-testid="input-email"]', uniqueEmail);
        await page.fill('[data-testid="input-password"]', 'Password123!');
        await page.click('[data-testid="button-signin"]');

        const startTime = Date.now();
        await page.waitForURL('**/dashboard', { timeout: 30000 });
        await page.waitForSelector('[data-testid^="card-asset-"]', { timeout: 60000 });
        const endTime = Date.now();

        const loadDuration = endTime - startTime;

        let currentResults = {};
        if (fs.existsSync(resultsPath)) {
            currentResults = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
        }

        const finalResults = {
            ...currentResults,
            returningUser: {
                loadDuration,
                timestamp: new Date().toISOString()
            }
        };

        fs.writeFileSync(resultsPath, JSON.stringify(finalResults, null, 2));
        console.log(`RETURNING USER DASHBOARD LOAD DURATION: ${loadDuration}ms`);
    });
});
