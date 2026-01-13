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
exports.acquireLock = exports.logSchedulerEvent = exports.updateSchedulerStatus = exports.checkSchedulerEnabled = void 0;
const init_1 = require("./init");
const admin = __importStar(require("firebase-admin"));
const CONTROL_COLLECTION = 'scheduler_control';
const LOG_COLLECTION = 'scheduler_audit_log';
const LOCK_COLLECTION = 'locks';
/**
 * Check if scheduler is enabled
 */
async function checkSchedulerEnabled(schedulerName) {
    var _a;
    const doc = await init_1.db.collection(CONTROL_COLLECTION).doc(schedulerName).get();
    if (!doc.exists) {
        // Default to enabled if config missing, but log warning
        console.warn(`[Scheduler] Control doc for ${schedulerName} missing. Defaulting to true.`);
        return true;
    }
    return ((_a = doc.data()) === null || _a === void 0 ? void 0 : _a.enabled) !== false; // Enable unless explicitly false
}
exports.checkSchedulerEnabled = checkSchedulerEnabled;
/**
 * Update scheduler status after run
 */
async function updateSchedulerStatus(schedulerName, status, runId, error) {
    await init_1.db.collection(CONTROL_COLLECTION).doc(schedulerName).set({
        last_run_timestamp: new Date().toISOString(),
        last_run_id: runId,
        last_status: status,
        last_error: error || null
    }, { merge: true });
}
exports.updateSchedulerStatus = updateSchedulerStatus;
/**
 * Log structured event to audit log
 */
async function logSchedulerEvent(schedulerName, type, message, metadata) {
    await init_1.db.collection(LOG_COLLECTION).add({
        scheduler: schedulerName,
        type,
        message,
        metadata: metadata || {},
        timestamp: admin.firestore.FieldValue.serverTimestamp()
    });
    // Also log to Cloud Logging
    const logPrefix = `[${schedulerName}]`;
    if (type === 'error')
        console.error(logPrefix, message, metadata);
    else if (type === 'warn')
        console.warn(logPrefix, message, metadata);
    else
        console.log(logPrefix, message, metadata);
}
exports.logSchedulerEvent = logSchedulerEvent;
/**
 * Distributed Lock
 * Tries to acquire a lock for a specific duration.
 * Returns true if acquired, false if locked by someone else.
 */
async function acquireLock(lockName, leaseTimeIds = 60000) {
    const lockRef = init_1.db.collection(LOCK_COLLECTION).doc(lockName);
    return await init_1.db.runTransaction(async (t) => {
        const doc = await t.get(lockRef);
        const now = Date.now();
        if (doc.exists) {
            const data = doc.data();
            if ((data === null || data === void 0 ? void 0 : data.expiresAt) > now) {
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
exports.acquireLock = acquireLock;
//# sourceMappingURL=utils.js.map