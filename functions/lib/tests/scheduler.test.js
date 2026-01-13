"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const index = __importStar(require("../index"));
const utils = __importStar(require("../utils"));
const coingecko = __importStar(require("../umf/coingecko"));
const firestoreUmf = __importStar(require("../umf/firestore"));
// Mocks
vitest_1.vi.mock('firebase-functions/logger', () => ({
    info: vitest_1.vi.fn(),
    warn: vitest_1.vi.fn(),
    error: vitest_1.vi.fn(),
}));
vitest_1.vi.mock('../utils');
vitest_1.vi.mock('../umf/coingecko');
vitest_1.vi.mock('../umf/firestore');
vitest_1.vi.mock('firebase-admin', () => ({
    apps: [],
    credential: {
        cert: vitest_1.vi.fn(),
        applicationDefault: vitest_1.vi.fn(),
    },
    firestore: () => ({
        collection: vitest_1.vi.fn(() => ({
            doc: vitest_1.vi.fn(() => ({
                get: vitest_1.vi.fn(),
                set: vitest_1.vi.fn(),
            })),
            add: vitest_1.vi.fn(),
        })),
    }),
    initializeApp: vitest_1.vi.fn(),
}));
(0, vitest_1.describe)('Scheduler Logic', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.resetAllMocks();
    });
    (0, vitest_1.describe)('runUmfLogic', () => {
        (0, vitest_1.it)('should skip if disabled in control plane', async () => {
            // Setup
            vitest_1.vi.spyOn(utils, 'checkSchedulerEnabled').mockResolvedValue(false);
            // Execute
            await index.runUmfLogic();
            // Assert
            (0, vitest_1.expect)(utils.checkSchedulerEnabled).toHaveBeenCalledWith('umf');
            (0, vitest_1.expect)(utils.acquireLock).not.toHaveBeenCalled(); // Should stop early
        });
        (0, vitest_1.it)('should fetch data and write to firestore if enabled', async () => {
            // Setup
            vitest_1.vi.spyOn(utils, 'checkSchedulerEnabled').mockResolvedValue(true);
            vitest_1.vi.spyOn(utils, 'acquireLock').mockResolvedValue(true);
            vitest_1.vi.spyOn(coingecko, 'fetchTopCoinsByMarketCap').mockResolvedValue({
                assets: [{ id: 'bitcoin', symbol: 'btc', name: 'Bitcoin', price: 50000 }],
                timestamp_utc: '2023-01-01T00:00:00Z'
            });
            vitest_1.vi.spyOn(firestoreUmf, 'writeLiveSnapshot').mockResolvedValue();
            vitest_1.vi.spyOn(firestoreUmf, 'appendHistorySnapshot').mockResolvedValue();
            vitest_1.vi.spyOn(firestoreUmf, 'trimHistory').mockResolvedValue(0);
            // Execute
            const result = await index.runUmfLogic();
            // Assert
            (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.success).toBe(true);
            (0, vitest_1.expect)(result === null || result === void 0 ? void 0 : result.count).toBe(1);
            (0, vitest_1.expect)(firestoreUmf.writeLiveSnapshot).toHaveBeenCalled();
            (0, vitest_1.expect)(utils.logSchedulerEvent).toHaveBeenCalledWith('umf', 'success', vitest_1.expect.any(String), vitest_1.expect.any(Object));
        });
        (0, vitest_1.it)('should fail if fetch throws', async () => {
            // Setup
            vitest_1.vi.spyOn(utils, 'checkSchedulerEnabled').mockResolvedValue(true);
            vitest_1.vi.spyOn(utils, 'acquireLock').mockResolvedValue(true);
            vitest_1.vi.spyOn(coingecko, 'fetchTopCoinsByMarketCap').mockRejectedValue(new Error('API Down'));
            // Execute & Assert
            await (0, vitest_1.expect)(index.runUmfLogic()).rejects.toThrow('API Down');
            (0, vitest_1.expect)(utils.updateSchedulerStatus).toHaveBeenCalledWith('umf', 'failure', vitest_1.expect.any(String), 'API Down');
        });
    });
});
//# sourceMappingURL=scheduler.test.js.map