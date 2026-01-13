/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['server/tests/**/*.test.ts'],
        alias: {
            '@shared': '/shared',
        }
    },
});
