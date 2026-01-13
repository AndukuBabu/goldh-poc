/**
 * Firestore Operations for Guru Digest
 * 
 * Handles all Firestore CRUD operations for the guruDigest collection.
 */

import { db } from '../init';
import type { GuruDigestEntry } from './rss';
// import admin from 'firebase-admin'; // Not strictly used directly here, usually for FieldValue, but not seen in original code except import

export interface GuruDigestEntryWithId extends GuruDigestEntry {
    id: string;
}

const COLLECTION_NAME = 'guruDigest';

export async function clearGuruDigest(): Promise<number> {
    try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const batch = db.batch();
        snapshot.docs.forEach((doc) => {
            batch.delete(doc.ref);
        });
        await batch.commit();
        return snapshot.size;
    } catch (error) {
        console.error('[Guru] Error clearing collection:', error);
        throw error;
    }
}

export async function addGuruDigestEntry(entry: GuruDigestEntry): Promise<string> {
    try {
        const docRef = await db.collection(COLLECTION_NAME).add(entry);
        return docRef.id;
    } catch (error) {
        console.error('[Guru] Error adding entry:', error);
        throw error;
    }
}

export async function addGuruDigestEntries(entries: GuruDigestEntry[]): Promise<number> {
    let successCount = 0;

    const promises = entries.map(async (entry) => {
        try {
            await addGuruDigestEntry(entry);
            successCount++;
        } catch (error) {
            console.error('[Guru] Failed to add entry:', entry.title.substring(0, 60), error);
        }
    });

    await Promise.all(promises);
    return successCount;
}

export async function getGuruDigestByAsset(symbol: string): Promise<GuruDigestEntry[]> {
    const snapshot = await db.collection(COLLECTION_NAME)
        .where('assets', 'array-contains', symbol)
        .get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            title: data.title || '',
            summary: data.summary || '',
            link: data.link || '',
            date: data.date || new Date().toISOString(),
            assets: data.assets || [],
        };
    });
}

export async function getAllGuruDigest(maxEntries: number = 50): Promise<GuruDigestEntry[]> {
    const snapshot = await db.collection(COLLECTION_NAME)
        .orderBy('date', 'desc')
        .limit(maxEntries)
        .get();

    return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            title: data.title || '',
            summary: data.summary || '',
            link: data.link || '',
            date: data.date || new Date().toISOString(),
            assets: data.assets || [],
        };
    });
}

export async function getAllGuruDigestWithIds(maxEntries: number = 100): Promise<GuruDigestEntryWithId[]> {
    const snapshot = await db.collection(COLLECTION_NAME)
        .orderBy('date', 'desc')
        .limit(maxEntries)
        .get();

    return snapshot.docs.map(docSnapshot => {
        const data = docSnapshot.data();
        return {
            id: docSnapshot.id,
            title: data.title || '',
            summary: data.summary || '',
            link: data.link || '',
            date: data.date || new Date().toISOString(),
            assets: data.assets || [],
        };
    });
}

export async function deleteGuruDigestEntry(entryId: string): Promise<void> {
    try {
        await db.collection(COLLECTION_NAME).doc(entryId).delete();
        console.log(`[Guru] Deleted entry: ${entryId}`);
    } catch (error) {
        console.error('[Guru] Error deleting entry:', entryId, error);
        throw error;
    }
}
