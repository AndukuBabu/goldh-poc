import { onSchedule } from "firebase-functions/v2/scheduler";
import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";

// UMF Modules
import { fetchTopCoinsByMarketCap } from './umf/coingecko';
import { writeLiveSnapshot, appendHistorySnapshot, trimHistory } from './umf/firestore';

// Guru Modules
import { updateGuruDigest } from './guru/updater';

// Shared Utils
import { checkSchedulerEnabled, acquireLock, logSchedulerEvent, updateSchedulerStatus } from './utils';

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
export const runUmfLogic = async (isManual = false) => {
    const runId = `run_${Date.now()}`;
    const schedulerName = 'umf';

    try {
        if (!isManual) {
            // 1. Check if enabled
            const enabled = await checkSchedulerEnabled(schedulerName);
            if (!enabled) {
                logger.info(`[UMF] Scheduler disabled in control plane. Skipping.`);
                return;
            }

            // 2. Acquire Lock (Safety) - 5 min lease
            if (!(await acquireLock(UMF_LOCK_NAME, 5 * 60 * 1000))) {
                logger.warn(`[UMF] Could not acquire lock. Overlapping run? Skipping.`);
                return;
            }
        }

        // 3. Execution
        await logSchedulerEvent(schedulerName, 'info', 'Starting market data fetch', { runId });

        // Fetch Data
        const apiKey = process.env.GH_EXT_COINGECKO_API_KEY;
        const result = await fetchTopCoinsByMarketCap(TOP_COINS_COUNT, apiKey);

        const snapshot = {
            timestamp_utc: result.timestamp_utc,
            assets: result.assets,
            degraded: false
        };

        // Write to Firestore (Push-based cache source)
        await writeLiveSnapshot(snapshot);
        await appendHistorySnapshot(snapshot);
        const trimmed = await trimHistory(HISTORY_MAX);

        // 4. Success Logging
        const message = `Updated ${result.assets.length} assets. Trimmed ${trimmed} history docs.`;
        await logSchedulerEvent(schedulerName, 'success', message, {
            items: result.assets.length,
            duration: Date.now() - parseInt(runId.split('_')[1]) // Approx
        });

        await updateSchedulerStatus(schedulerName, 'success', runId);
        return { success: true, count: result.assets.length };

    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`[UMF] Failed: ${msg}`);
        await logSchedulerEvent(schedulerName, 'error', `Run failed: ${msg}`, { error: msg });
        await updateSchedulerStatus(schedulerName, 'failure', runId, msg);
        throw error;
    }
};

export const runGuruLogic = async (isManual = false) => {
    const runId = `run_${Date.now()}`;
    const schedulerName = 'guru';

    try {
        if (!isManual) {
            if (!(await checkSchedulerEnabled(schedulerName))) {
                logger.info(`[Guru] Disabled. Skipping.`);
                return;
            }

            if (!(await acquireLock(GURU_LOCK_NAME, 10 * 60 * 1000))) {
                logger.warn(`[Guru] Locked. Skipping.`);
                return;
            }
        }

        await logSchedulerEvent(schedulerName, 'info', 'Starting news update', { runId });

        const result = await updateGuruDigest({
            clearFirst: true,
            logPrefix: '[GuruWorker]'
        });

        const message = `Saved ${result.successfulEntries} articles.`;
        await logSchedulerEvent(schedulerName, 'success', message, result);
        await updateSchedulerStatus(schedulerName, 'success', runId);
        return { success: true, stats: result };

    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`[Guru] Failed: ${msg}`);
        await logSchedulerEvent(schedulerName, 'error', msg);
        await updateSchedulerStatus(schedulerName, 'failure', runId, msg);
        throw error;
    }
};

/**
 * UMF Ticker (Market Data)
 * Frequency: "0 * * * *" (Every hour)
 */
export const umfTicker = onSchedule("0 * * * *", async (event) => {
    logger.info(`[UMF] Starting run via Schedule`);
    await runUmfLogic();
});

/**
 * Guru Ticker (News Digest)
 * Frequency: Every 2 hours (0 *\/2 * * *)
 */
export const guruTicker = onSchedule("0 */2 * * *", async (event) => {
    logger.info(`[Guru] Starting run via Schedule`);
    await runGuruLogic();
});

/**
 * Manual Trigger: UMF
 * Callable Function for Admin Dashboard
 */
export const refreshUmf = onCall(async (request) => {
    // Auth Check
    if (!request.auth || !request.auth.token.admin) {
        throw new HttpsError('permission-denied', 'Must be an admin to trigger refresh.');
    }

    const runId = `manual_${Date.now()}`;
    const schedulerName = 'umf';

    try {
        await logSchedulerEvent(schedulerName, 'info', 'Manual refresh triggered', { user: request.auth.uid });

        // Fetch
        const apiKey = process.env.GH_EXT_COINGECKO_API_KEY;
        const result = await fetchTopCoinsByMarketCap(TOP_COINS_COUNT, apiKey);

        const snapshot = {
            timestamp_utc: result.timestamp_utc,
            assets: result.assets,
            degraded: false
        };

        await writeLiveSnapshot(snapshot);
        // Optional: history, trimming? Yes, treat as normal run.
        await appendHistorySnapshot(snapshot);
        await trimHistory(HISTORY_MAX);

        await updateSchedulerStatus(schedulerName, 'success', runId);
        return { success: true, count: result.assets.length };

    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await updateSchedulerStatus(schedulerName, 'failure', runId, msg);
        throw new HttpsError('internal', msg);
    }
});

/**
 * Manual Trigger: Guru
 */
export const refreshGuru = onCall(async (request) => {
    if (!request.auth || !request.auth.token.admin) {
        throw new HttpsError('permission-denied', 'Must be an admin.');
    }

    const runId = `manual_${Date.now()}`;
    const schedulerName = 'guru';

    try {
        await logSchedulerEvent(schedulerName, 'info', 'Manual refresh triggered', { user: request.auth.uid });

        const result = await updateGuruDigest({ clearFirst: true });

        await updateSchedulerStatus(schedulerName, 'success', runId);
        return { success: true, stats: result };

    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        await updateSchedulerStatus(schedulerName, 'failure', runId, msg);
        throw new HttpsError('internal', msg);
    }
});
