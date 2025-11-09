/**
 * Firestore Operations for Guru Digest
 * 
 * Handles all Firestore CRUD operations for the guruDigest collection.
 */

import { collection, addDoc, getDocs, deleteDoc } from 'firebase/firestore';
import { getDb } from './firebase';
import type { GuruDigestEntry } from './rss';

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
  const db = getDb();
  
  try {
    const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
    const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    
    return querySnapshot.docs.length;
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
  const db = getDb();
  
  try {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), entry);
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
