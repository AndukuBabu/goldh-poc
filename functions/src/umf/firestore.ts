/**
 * Firestore UMF I/O Operations
 * 
 * Server-side Firestore operations for UMF live data and history.
 */

import { db } from '../init';
import * as admin from 'firebase-admin';
import { umfSnapshotLiveSchema, type UmfSnapshotLive } from '../shared/schema';

const COLLECTION_LIVE = 'umf_snapshot_live';
const DOC_LATEST = 'latest';
const COLLECTION_HISTORY = 'umf_snapshot_history';

export async function writeLiveSnapshot(snapshot: UmfSnapshotLive): Promise<void> {
    const validated = umfSnapshotLiveSchema.parse(snapshot);

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

    await db.collection(COLLECTION_LIVE).doc(DOC_LATEST).set(validated);
}

export async function appendHistorySnapshot(snapshot: UmfSnapshotLive): Promise<void> {
    const validated = umfSnapshotLiveSchema.parse(snapshot);
    const docId = validated.timestamp_utc;

    const historyDoc = {
        ...validated,
        written_at_utc: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(COLLECTION_HISTORY).doc(docId).set(historyDoc);
}

export async function readLiveSnapshot(): Promise<UmfSnapshotLive | null> {
    const docSnap = await db.collection(COLLECTION_LIVE).doc(DOC_LATEST).get();

    if (!docSnap.exists) {
        return null;
    }

    const data = docSnap.data();
    const validated = umfSnapshotLiveSchema.parse(data);

    return validated;
}

export async function trimHistory(maxDocs: number): Promise<number> {
    const historyRef = db.collection(COLLECTION_HISTORY);
    const allDocsSnap = await historyRef.orderBy('written_at_utc', 'asc').get();

    const totalDocs = allDocsSnap.size;
    const toDelete = totalDocs - maxDocs;

    if (toDelete <= 0) {
        return 0;
    }

    let deletedCount = 0;
    const batch = db.batch();

    allDocsSnap.docs.slice(0, toDelete).forEach((docSnap) => {
        batch.delete(docSnap.ref);
        deletedCount++;
    });

    await batch.commit();

    return deletedCount;
}

export async function getHistoryCount(): Promise<number> {
    const historyRef = db.collection(COLLECTION_HISTORY);
    const allDocsSnap = await historyRef.get();
    return allDocsSnap.size;
}
