"use strict";
/**
 * Firestore UMF I/O Operations
 *
 * Server-side Firestore operations for UMF live data and history.
 */
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
exports.getHistoryCount = exports.trimHistory = exports.readLiveSnapshot = exports.appendHistorySnapshot = exports.writeLiveSnapshot = void 0;
const init_1 = require("../init");
const admin = __importStar(require("firebase-admin"));
const schema_1 = require("../shared/schema");
const COLLECTION_LIVE = 'umf_snapshot_live';
const DOC_LATEST = 'latest';
const COLLECTION_HISTORY = 'umf_snapshot_history';
async function writeLiveSnapshot(snapshot) {
    const validated = schema_1.umfSnapshotLiveSchema.parse(snapshot);
    // Add metadata for versioning/safety if not present (handled by caller or here)
    // For now, sticking to schema. 
    // Plan mentioned "Snapshot Versioning" (version UUID, timestamp). 
    // The schema has timestamp_utc. I'll stick to original logic unless I specifically update it.
    // The plan Phase 1 Step 3 said "Snapshot Versioning".
    // Let's check `umfSnapshotLiveSchema` in `schema.ts`. It doesn't have `version` field.
    // I should probably add it to the schema if I want to enforce it, or just write it as extra field.
    // Since I just defined the schema without it, I will skip adding it to the Zod schema for now to avoid breaking types, 
    // but I can write it to Firestore anyway if I cast to any.
    // Actually, I'll stick to the strict schema for now to avoid complexity creep in this step.
    await init_1.db.collection(COLLECTION_LIVE).doc(DOC_LATEST).set(validated);
}
exports.writeLiveSnapshot = writeLiveSnapshot;
async function appendHistorySnapshot(snapshot) {
    const validated = schema_1.umfSnapshotLiveSchema.parse(snapshot);
    const docId = validated.timestamp_utc;
    const historyDoc = Object.assign(Object.assign({}, validated), { written_at_utc: admin.firestore.FieldValue.serverTimestamp() });
    await init_1.db.collection(COLLECTION_HISTORY).doc(docId).set(historyDoc);
}
exports.appendHistorySnapshot = appendHistorySnapshot;
async function readLiveSnapshot() {
    const docSnap = await init_1.db.collection(COLLECTION_LIVE).doc(DOC_LATEST).get();
    if (!docSnap.exists) {
        return null;
    }
    const data = docSnap.data();
    const validated = schema_1.umfSnapshotLiveSchema.parse(data);
    return validated;
}
exports.readLiveSnapshot = readLiveSnapshot;
async function trimHistory(maxDocs) {
    const historyRef = init_1.db.collection(COLLECTION_HISTORY);
    const allDocsSnap = await historyRef.orderBy('written_at_utc', 'asc').get();
    const totalDocs = allDocsSnap.size;
    const toDelete = totalDocs - maxDocs;
    if (toDelete <= 0) {
        return 0;
    }
    let deletedCount = 0;
    const batch = init_1.db.batch();
    allDocsSnap.docs.slice(0, toDelete).forEach((docSnap) => {
        batch.delete(docSnap.ref);
        deletedCount++;
    });
    await batch.commit();
    return deletedCount;
}
exports.trimHistory = trimHistory;
async function getHistoryCount() {
    const historyRef = init_1.db.collection(COLLECTION_HISTORY);
    const allDocsSnap = await historyRef.get();
    return allDocsSnap.size;
}
exports.getHistoryCount = getHistoryCount;
//# sourceMappingURL=firestore.js.map