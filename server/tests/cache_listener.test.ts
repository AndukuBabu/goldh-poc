import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { setupCacheListeners } from '../listeners';
import { getFresh } from '../umf/lib/cache';

// Mock Config
vi.mock('../config', () => ({
    config: {
        UMF_SCHEDULER: true,
        GURU_SCHEDULER: true,
    },
}));

// Mock Firebase
const onSnapshotMock = vi.fn();
vi.mock('../firebase', () => ({
    db: {
        collection: vi.fn(() => ({
            doc: vi.fn(() => ({
                onSnapshot: onSnapshotMock
            }))
        }))
    }
}));

// Mock Logger
vi.spyOn(console, 'log').mockImplementation(() => { });
vi.spyOn(console, 'error').mockImplementation(() => { });
vi.spyOn(console, 'warn').mockImplementation(() => { });

describe('Server Cache Listeners', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should setup listener and hydrate cache on snapshot', async () => {
        // 1. Setup Listeners
        setupCacheListeners();

        expect(onSnapshotMock).toHaveBeenCalled();

        // 2. Simulate Callback (Snapshot Update)
        const mockSnapshot = {
            exists: true,
            data: () => ({
                timestamp_utc: '2023-01-01T12:00:00Z',
                assets: [{
                    id: 'bitcoin',
                    symbol: 'BTC',
                    name: 'Bitcoin',
                    class: 'crypto',
                    price: 100000,
                    changePct24h: 5.0,
                    volume24h: 1000000,
                    marketCap: 50000000,
                    updatedAt_utc: '2023-01-01T12:00:00Z'
                }]
            })
        };

        // Get the callback function passed to onSnapshot
        const callback = onSnapshotMock.mock.calls[0][0]; // First call, first arg

        // Execute callback
        callback(mockSnapshot);

        // 3. Assert Cache Updated
        const cached = getFresh('umf:snapshot');
        expect(cached).toBeDefined();
        // @ts-ignore
        expect(cached.timestamp_utc).toBe('2023-01-01T12:00:00Z');
        // @ts-ignore
        expect(cached.assets[0].symbol).toBe('BTC');
    });

    it('should handle missing data safely', () => {
        setupCacheListeners();
        const callback = onSnapshotMock.mock.calls[0][0];

        const emptySnapshot = { exists: false, data: () => null };
        callback(emptySnapshot);

        // Should warn (not error)
        expect(console.warn).toHaveBeenCalled();
    });
});
