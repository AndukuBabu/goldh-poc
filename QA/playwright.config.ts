import { defineConfig, devices } from '@playwright/test';
import path from 'path';

export default defineConfig({
    testDir: './e2e',
    outputDir: './results',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: [
        ['list'],
        ['html', { outputFolder: './reports', open: 'never' }]
    ],
    use: {
        baseURL: 'http://localhost:5000',
        trace: 'on-first-retry',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:5000',
        reuseExistingServer: true,
        timeout: 120000,
    },
});
