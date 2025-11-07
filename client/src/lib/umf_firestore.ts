/**
 * UMF Firestore Client Helpers
 * 
 * Client-side read-only helpers for accessing UMF data directly from Firestore.
 * Uses Firebase client SDK for browser-based Firestore queries.
 * 
 * Collections:
 * - umf_snapshot_live/latest - Current live snapshot
 * - umf_snapshot_history/{timestamp} - Historical snapshots
 * 
 * Features:
 * - Read-only (writing is server-only via scheduler)
 * - Zod validation for runtime type safety
 * - Direct Firestore access (bypasses API routes)
 * 
 * Use Cases:
 * - Fallback when API routes are unavailable
 * - Historical data queries
 * - Real-time updates via Firestore listeners (future)
 * 
 * @see docs/UMF-Live-Firestore.md for architecture
 */

import { db } from './firebase';
import { doc, getDoc, collection, query, orderBy, limit as firestoreLimit, getDocs } from 'firebase/firestore';
import { umfSnapshotLiveSchema, type UmfSnapshotLive } from '@shared/schema';

/**
 * Firestore Collection Names
 */
const COLLECTION_LIVE = 'umf_snapshot_live';
const DOC_LATEST = 'latest';
const COLLECTION_HISTORY = 'umf_snapshot_history';

/**
 * Get UMF Snapshot (Live)
 * 
 * Reads the current live snapshot from Firestore.
 * Returns null if document doesn't exist.
 * 
 * Collection: umf_snapshot_live
 * Document: latest
 * 
 * Validation:
 * - Validates with Zod schema after reading
 * - Throws error if validation fails
 * 
 * @returns Promise resolving to UmfSnapshotLive or null if not found
 * @throws Error if validation fails or Firestore read fails
 * 
 * @example
 * ```typescript
 * const snapshot = await getUmfSnapshotLive();
 * if (snapshot) {
 *   console.log('Found:', snapshot.assets.length, 'assets');
 *   console.log('Timestamp:', snapshot.timestamp_utc);
 *   console.log('Degraded:', snapshot.degraded);
 * } else {
 *   console.log('No snapshot available');
 * }
 * ```
 */
export async function getUmfSnapshotLive(): Promise<UmfSnapshotLive | null> {
  try {
    // Read from umf_snapshot_live/latest
    const docRef = doc(db, COLLECTION_LIVE, DOC_LATEST);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      // Document doesn't exist
      return null;
    }
    
    // Get data and validate
    const data = docSnap.data();
    
    // Validate with Zod
    const validated = umfSnapshotLiveSchema.parse(data);
    
    return validated;
  } catch (error) {
    console.error('[UMF Firestore] Failed to get live snapshot:', error);
    throw error;
  }
}

/**
 * Get UMF Snapshot History
 * 
 * Reads the most recent N snapshots from history collection.
 * Returns empty array if no history exists.
 * 
 * Collection: umf_snapshot_history
 * Ordering: written_at_utc descending (newest first)
 * 
 * Validation:
 * - Validates each snapshot with Zod schema
 * - Filters out invalid snapshots (logs warnings)
 * 
 * @param limit - Maximum number of snapshots to retrieve (default: 50, max: 100)
 * @returns Promise resolving to array of UmfSnapshotLive (newest first)
 * 
 * @example
 * ```typescript
 * // Get last 48 hours (48 snapshots)
 * const history = await getUmfSnapshotHistory(48);
 * console.log(`Retrieved ${history.length} historical snapshots`);
 * 
 * // Display timestamps
 * history.forEach((snapshot, index) => {
 *   console.log(`${index + 1}. ${snapshot.timestamp_utc} - ${snapshot.assets.length} assets`);
 * });
 * ```
 */
export async function getUmfSnapshotHistory(limit: number = 50): Promise<UmfSnapshotLive[]> {
  try {
    // Enforce maximum limit
    const effectiveLimit = Math.min(limit, 100);
    
    // Query history collection ordered by written_at_utc descending (newest first)
    const historyRef = collection(db, COLLECTION_HISTORY);
    const historyQuery = query(
      historyRef,
      orderBy('written_at_utc', 'desc'),
      firestoreLimit(effectiveLimit)
    );
    
    const querySnapshot = await getDocs(historyQuery);
    
    if (querySnapshot.empty) {
      // No history available
      return [];
    }
    
    // Parse and validate each snapshot
    const snapshots: UmfSnapshotLive[] = [];
    
    querySnapshot.forEach((docSnap) => {
      try {
        const data = docSnap.data();
        
        // Validate with Zod
        const validated = umfSnapshotLiveSchema.parse(data);
        
        snapshots.push(validated);
      } catch (error) {
        // Log validation error but don't throw (skip invalid snapshots)
        console.warn(
          `[UMF Firestore] Invalid snapshot in history (${docSnap.id}):`,
          error instanceof Error ? error.message : String(error)
        );
      }
    });
    
    return snapshots;
  } catch (error) {
    console.error('[UMF Firestore] Failed to get snapshot history:', error);
    throw error;
  }
}

/**
 * Get UMF Snapshot Count (History)
 * 
 * Returns the total number of snapshots in history collection.
 * Useful for pagination or displaying total available history.
 * 
 * Note: This fetches all documents to count them (Firestore limitation).
 * For large collections, consider using a counter document.
 * 
 * @returns Promise resolving to number of history snapshots
 * 
 * @example
 * ```typescript
 * const count = await getUmfSnapshotHistoryCount();
 * console.log(`Total history: ${count} snapshots`);
 * ```
 */
export async function getUmfSnapshotHistoryCount(): Promise<number> {
  try {
    const historyRef = collection(db, COLLECTION_HISTORY);
    const querySnapshot = await getDocs(historyRef);
    
    return querySnapshot.size;
  } catch (error) {
    console.error('[UMF Firestore] Failed to get history count:', error);
    throw error;
  }
}
