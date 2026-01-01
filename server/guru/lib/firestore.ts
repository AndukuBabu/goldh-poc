/**
 * Firestore Operations for Guru Digest
 * 
 * Handles all Firestore CRUD operations for the guruDigest collection.
 * Uses Firebase Admin SDK for better performance and security on the server.
 */

import { db } from '../../firebase';
import type { GuruDigestEntry } from './rss';
import admin from 'firebase-admin';

/**
 * Guru Digest Entry with Firestore ID
 */
export interface GuruDigestEntryWithId extends GuruDigestEntry {
  id: string;
}

/**
 * Firestore Collection Name
 */
const COLLECTION_NAME = 'guruDigest';

/**
 * Clear all existing entries from the guruDigest collection
 * 
 * Use this to remove old entries before fetching new ones.
 * Useful for scheduled updates to prevent duplicate entries.
 * 
 * @returns Number of entries deleted
 */
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

/**
 * Add Guru Digest Entry to Firestore
 * 
 * Stores a single article entry in the guruDigest collection.
 * 
 * @param entry - Guru digest entry to store
 * @returns Document ID of the created entry
 */
export async function addGuruDigestEntry(entry: GuruDigestEntry): Promise<string> {
  try {
    const docRef = await db.collection(COLLECTION_NAME).add(entry);
    return docRef.id;
  } catch (error) {
    console.error('[Guru] Error adding entry:', error);
    throw error;
  }
}

/**
 * Batch Add Guru Digest Entries
 * 
 * Adds multiple entries to Firestore in parallel.
 * Continues adding even if individual entries fail.
 * 
 * @param entries - Array of entries to add
 * @returns Number of successfully added entries
 */
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

/**
 * Get Guru Digest Entries by Asset Symbol
 * 
 * Queries Firestore for articles tagged with the specified asset symbol.
 * Uses array-contains query to filter by the 'assets' field.
 * 
 * @param symbol - Canonical asset symbol (e.g., 'BTC', 'ETH')
 * @returns Array of matching entries (empty if none found)
 * @throws Error if Firestore query fails
 */
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

/**
 * Get All Guru Digest Entries
 * 
 * Retrieves the latest N entries from Firestore, ordered by date descending.
 * Useful for displaying recent news on the landing page or news feed.
 * 
 * @param maxEntries - Maximum number of entries to return (default: 50)
 * @returns Array of entries ordered by date (newest first)
 * @throws Error if Firestore query fails
 */
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

/**
 * Get All Guru Digest Entries with IDs
 * 
 * Retrieves the latest N entries from Firestore with document IDs included.
 * Useful for admin management where you need to delete/edit specific entries.
 * 
 * @param maxEntries - Maximum number of entries to return (default: 100)
 * @returns Array of entries with IDs ordered by date (newest first)
 * @throws Error if Firestore query fails
 */
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

/**
 * Delete Guru Digest Entry by ID
 * 
 * Removes a single entry from the guruDigest collection by document ID.
 * Useful for admin management to remove specific articles.
 * 
 * @param entryId - Firestore document ID of the entry to delete
 * @throws Error if deletion fails
 */
export async function deleteGuruDigestEntry(entryId: string): Promise<void> {
  try {
    await db.collection(COLLECTION_NAME).doc(entryId).delete();
    console.log(`[Guru] Deleted entry: ${entryId}`);
  } catch (error) {
    console.error('[Guru] Error deleting entry:', entryId, error);
    throw error;
  }
}
