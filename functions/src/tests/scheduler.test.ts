import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as index from '../index';
import * as utils from '../utils';
import * as coingecko from '../umf/coingecko';
import * as firestoreUmf from '../umf/firestore';

// Mocks
vi.mock('firebase-functions/logger', () => ({
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
}));

vi.mock('../utils');
vi.mock('../umf/coingecko');
vi.mock('../umf/firestore');
vi.mock('firebase-admin', () => ({
    apps: [],
    credential: {
        cert: vi.fn(),
        applicationDefault: vi.fn(),
    },
    firestore: () => ({
        collection: vi.fn(() => ({
            doc: vi.fn(() => ({
                get: vi.fn(),
                set: vi.fn(),
            })),
            add: vi.fn(),
        })),
    }),
    initializeApp: vi.fn(),
}));

describe('Scheduler Logic', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    describe('runUmfLogic', () => {
        it('should skip if disabled in control plane', async () => {
            // Setup
            vi.spyOn(utils, 'checkSchedulerEnabled').mockResolvedValue(false);

            // Execute
            await index.runUmfLogic();

            // Assert
            expect(utils.checkSchedulerEnabled).toHaveBeenCalledWith('umf');
            expect(utils.acquireLock).not.toHaveBeenCalled(); // Should stop early
        });

        it('should fetch data and write to firestore if enabled', async () => {
            // Setup
            vi.spyOn(utils, 'checkSchedulerEnabled').mockResolvedValue(true);
            vi.spyOn(utils, 'acquireLock').mockResolvedValue(true);
            vi.spyOn(coingecko, 'fetchTopCoinsByMarketCap').mockResolvedValue({
                assets: [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', price: 50000 }] as any,
                timestamp_utc: '2023-01-01T00:00:00Z'
            });
            vi.spyOn(firestoreUmf, 'writeLiveSnapshot').mockResolvedValue();
            vi.spyOn(firestoreUmf, 'appendHistorySnapshot').mockResolvedValue();
            vi.spyOn(firestoreUmf, 'trimHistory').mockResolvedValue(0);

            // Execute
            const result = await index.runUmfLogic();

            // Assert
            expect(result?.success).toBe(true);
            expect(result?.count).toBe(1);
            expect(firestoreUmf.writeLiveSnapshot).toHaveBeenCalled();
            expect(utils.logSchedulerEvent).toHaveBeenCalledWith('umf', 'success', expect.any(String), expect.any(Object));
        });

        it('should fail if fetch throws', async () => {
            // Setup
            vi.spyOn(utils, 'checkSchedulerEnabled').mockResolvedValue(true);
            vi.spyOn(utils, 'acquireLock').mockResolvedValue(true);
            vi.spyOn(coingecko, 'fetchTopCoinsByMarketCap').mockRejectedValue(new Error('API Down'));

            // Execute & Assert
            await expect(index.runUmfLogic()).rejects.toThrow('API Down');
            expect(utils.updateSchedulerStatus).toHaveBeenCalledWith('umf', 'failure', expect.any(String), 'API Down');
        });
    });
});
