import { db } from './init';
import * as admin from 'firebase-admin';

const CONTROL_COLLECTION = 'scheduler_control';
const LOG_COLLECTION = 'scheduler_audit_log';
const LOCK_COLLECTION = 'locks';

export interface SchedulerStatus {
    enabled: boolean;
    last_run_timestamp?: string;
    last_run_id?: string;
    last_status?: 'success' | 'failure';
    last_error?: string;
}

/**
 * Check if scheduler is enabled
 */
export async function checkSchedulerEnabled(schedulerName: string): Promise<boolean> {
    const doc = await db.collection(CONTROL_COLLECTION).doc(schedulerName).get();
    if (!doc.exists) {
        // Default to enabled if config missing, but log warning
        console.warn(`[Scheduler] Control doc for ${schedulerName} missing. Defaulting to true.`);
        return true;
    }
    return doc.data()?.enabled !== false; // Enable unless explicitly false
}

/**
 * Update scheduler status after run
 */
export async function updateSchedulerStatus(
    schedulerName: string,
    status: 'success' | 'failure',
    runId: string,
    error?: string
) {
    await db.collection(CONTROL_COLLECTION).doc(schedulerName).set({
        last_run_timestamp: new Date().toISOString(),
        last_run_id: runId,
        last_status: status,
        last_error: error || null
    }, { merge: true });
}

/**
 * Log structured event to audit log
 */
export async function logSchedulerEvent(
    schedulerName: string,
    type: 'info' | 'warn' | 'error' | 'success',
    message: string,
    metadata?: Record<string, any>
) {
    await db.collection(LOG_COLLECTION).add({
        scheduler: schedulerName,
        type,
        message,
        metadata: metadata || {},
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });

    // Also log to Cloud Logging
    const logPrefix = `[${schedulerName}]`;
    if (type === 'error') console.error(logPrefix, message, metadata);
    else if (type === 'warn') console.warn(logPrefix, message, metadata);
    else console.log(logPrefix, message, metadata);
}

/**
 * Distributed Lock
 * Tries to acquire a lock for a specific duration.
 * Returns true if acquired, false if locked by someone else.
 */
export async function acquireLock(lockName: string, leaseTimeIds: number = 60000): Promise<boolean> {
    const lockRef = db.collection(LOCK_COLLECTION).doc(lockName);

    return await db.runTransaction(async (t) => {
        const doc = await t.get(lockRef);
        const now = Date.now();

        if (doc.exists) {
            const data = doc.data();
            if (data?.expiresAt > now) {
                return false; // Already locked and not expired
            }
        }

        t.set(lockRef, {
            acquiredAt: now,
            expiresAt: now + leaseTimeIds
        });
        return true;
    });
}
