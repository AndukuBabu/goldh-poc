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
exports.refreshGuru = exports.refreshUmf = exports.guruTicker = exports.umfTicker = exports.runGuruLogic = exports.runUmfLogic = void 0;
const scheduler_1 = require("firebase-functions/v2/scheduler");
const https_1 = require("firebase-functions/v2/https");
const logger = __importStar(require("firebase-functions/logger"));
// UMF Modules
const coingecko_1 = require("./umf/coingecko");
const firestore_1 = require("./umf/firestore");
// Guru Modules
const updater_1 = require("./guru/updater");
// Shared Utils
const utils_1 = require("./utils");
// Constants
const UMF_LOCK_NAME = 'umf_lock';
const GURU_LOCK_NAME = 'guru_lock';
const TOP_COINS_COUNT = 100;
const HISTORY_MAX = 48; // Keep 48 hours of history
/**
 * UMF Ticker (Market Data)
 * Frequency: "0 * * * *" (Every hour)
 */
// Logic Exports for Testing/Local Run
const runUmfLogic = async (isManual = false) => {
    const runId = `run_${Date.now()}`;
    const schedulerName = 'umf';
    try {
        if (!isManual) {
            // 1. Check if enabled
            const enabled = await (0, utils_1.checkSchedulerEnabled)(schedulerName);
            if (!enabled) {
                logger.info(`[UMF] Scheduler disabled in control plane. Skipping.`);
                return;
            }
            // 2. Acquire Lock (Safety) - 5 min lease
            if (!(await (0, utils_1.acquireLock)(UMF_LOCK_NAME, 5 * 60 * 1000))) {
                logger.warn(`[UMF] Could not acquire lock. Overlapping run? Skipping.`);
                return;
            }
        }
        // 3. Execution
        await (0, utils_1.logSchedulerEvent)(schedulerName, 'info', 'Starting market data fetch', { runId });
        // Fetch Data
        const apiKey = process.env.GH_EXT_COINGECKO_API_KEY;
        const result = await (0, coingecko_1.fetchTopCoinsByMarketCap)(TOP_COINS_COUNT, apiKey);
        const snapshot = {
            timestamp_utc: result.timestamp_utc,
            assets: result.assets,
            degraded: false
        };
        // Write to Firestore (Push-based cache source)
        await (0, firestore_1.writeLiveSnapshot)(snapshot);
        await (0, firestore_1.appendHistorySnapshot)(snapshot);
        const trimmed = await (0, firestore_1.trimHistory)(HISTORY_MAX);
        // 4. Success Logging
        const message = `Updated ${result.assets.length} assets. Trimmed ${trimmed} history docs.`;
        await (0, utils_1.logSchedulerEvent)(schedulerName, 'success', message, {
            items: result.assets.length,
            duration: Date.now() - parseInt(runId.split('_')[1]) // Approx
        });
        await (0, utils_1.updateSchedulerStatus)(schedulerName, 'success', runId);
        return { success: true, count: result.assets.length };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`[UMF] Failed: ${msg}`);
        await (0, utils_1.logSchedulerEvent)(schedulerName, 'error', `Run failed: ${msg}`, { error: msg });
        await (0, utils_1.updateSchedulerStatus)(schedulerName, 'failure', runId, msg);
        throw error;
    }
};
exports.runUmfLogic = runUmfLogic;
const runGuruLogic = async (isManual = false) => {
    const runId = `run_${Date.now()}`;
    const schedulerName = 'guru';
    try {
        if (!isManual) {
            if (!(await (0, utils_1.checkSchedulerEnabled)(schedulerName))) {
                logger.info(`[Guru] Disabled. Skipping.`);
                return;
            }
            if (!(await (0, utils_1.acquireLock)(GURU_LOCK_NAME, 10 * 60 * 1000))) {
                logger.warn(`[Guru] Locked. Skipping.`);
                return;
            }
        }
        await (0, utils_1.logSchedulerEvent)(schedulerName, 'info', 'Starting news update', { runId });
        const result = await (0, updater_1.updateGuruDigest)({
            clearFirst: true,
            logPrefix: '[GuruWorker]'
        });
        const message = `Saved ${result.successfulEntries} articles.`;
        await (0, utils_1.logSchedulerEvent)(schedulerName, 'success', message, result);
        await (0, utils_1.updateSchedulerStatus)(schedulerName, 'success', runId);
        return { success: true, stats: result };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`[Guru] Failed: ${msg}`);
        await (0, utils_1.logSchedulerEvent)(schedulerName, 'error', msg);
        await (0, utils_1.updateSchedulerStatus)(schedulerName, 'failure', runId, msg);
        throw error;
    }
};
exports.runGuruLogic = runGuruLogic;
/**
 * UMF Ticker (Market Data)
 * Frequency: "0 * * * *" (Every hour)
 */
exports.umfTicker = (0, scheduler_1.onSchedule)("0 * * * *", async (event) => {
    logger.info(`[UMF] Starting run via Schedule`);
    await (0, exports.runUmfLogic)();
});
/**
 * Guru Ticker (News Digest)
 * Frequency: Every 2 hours (0 *\/2 * * *)
 */
exports.guruTicker = (0, scheduler_1.onSchedule)("0 */2 * * *", async (event) => {
    logger.info(`[Guru] Starting run via Schedule`);
    await (0, exports.runGuruLogic)();
});
/**
 * Manual Trigger: UMF
 * Callable Function for Admin Dashboard
 */
exports.refreshUmf = (0, https_1.onCall)(async (request) => {
    // Auth Check
    if (!request.auth || !request.auth.token.admin) {
        throw new https_1.HttpsError('permission-denied', 'Must be an admin to trigger refresh.');
    }
    const runId = `manual_${Date.now()}`;
    const schedulerName = 'umf';
    try {
        await (0, utils_1.logSchedulerEvent)(schedulerName, 'info', 'Manual refresh triggered', { user: request.auth.uid });
        // Fetch
        const apiKey = process.env.GH_EXT_COINGECKO_API_KEY;
        const result = await (0, coingecko_1.fetchTopCoinsByMarketCap)(TOP_COINS_COUNT, apiKey);
        const snapshot = {
            timestamp_utc: result.timestamp_utc,
            assets: result.assets,
            degraded: false
        };
        await (0, firestore_1.writeLiveSnapshot)(snapshot);
        // Optional: history, trimming? Yes, treat as normal run.
        await (0, firestore_1.appendHistorySnapshot)(snapshot);
        await (0, firestore_1.trimHistory)(HISTORY_MAX);
        await (0, utils_1.updateSchedulerStatus)(schedulerName, 'success', runId);
        return { success: true, count: result.assets.length };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await (0, utils_1.updateSchedulerStatus)(schedulerName, 'failure', runId, msg);
        throw new https_1.HttpsError('internal', msg);
    }
});
/**
 * Manual Trigger: Guru
 */
exports.refreshGuru = (0, https_1.onCall)(async (request) => {
    if (!request.auth || !request.auth.token.admin) {
        throw new https_1.HttpsError('permission-denied', 'Must be an admin.');
    }
    const runId = `manual_${Date.now()}`;
    const schedulerName = 'guru';
    try {
        await (0, utils_1.logSchedulerEvent)(schedulerName, 'info', 'Manual refresh triggered', { user: request.auth.uid });
        const result = await (0, updater_1.updateGuruDigest)({ clearFirst: true });
        await (0, utils_1.updateSchedulerStatus)(schedulerName, 'success', runId);
        return { success: true, stats: result };
    }
    catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await (0, utils_1.updateSchedulerStatus)(schedulerName, 'failure', runId, msg);
        throw new https_1.HttpsError('internal', msg);
    }
});
//# sourceMappingURL=index.js.map