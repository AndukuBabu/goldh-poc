/**
 * Firestore UMF I/O Operations
 * 
 * Server-side Firestore operations for UMF live data and history.
 * Uses Firebase client SDK for Firestore operations with Zod validation.
 * 
 * Collections:
 * - umf_snapshot_live/latest - Current live snapshot (overwritten)
 * - umf_snapshot_history/{timestamp} - Historical snapshots (append-only)
 * 
 * Features:
 * - Zod validation before writes/reads
 * - Server timestamp for history entries
 * - Automatic cleanup of old history
 * - Type-safe operations
 * 
 * @see docs/UMF-Live-Firestore.md for integration architecture
 */

import { initializeApp, getApps } from 'firebase/app';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  deleteDoc,
  serverTimestamp,
  Timestamp,
  type Firestore,
} from 'firebase/firestore';
import { umfSnapshotLiveSchema, type UmfSnapshotLive } from '@shared/schema';

/**
 * Firebase Configuration from Environment Variables
 * 
 * All credentials stored securely in Replit secrets.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

/**
 * Validate Required Environment Variables
 */
const requiredEnvVars = [
  'FIREBASE_API_KEY',
  'FIREBASE_AUTH_DOMAIN',
  'FIREBASE_PROJECT_ID',
  'FIREBASE_STORAGE_BUCKET',
  'FIREBASE_MESSAGING_SENDER_ID',
  'FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

/**
 * Firestore Collection Names
 */
const COLLECTION_LIVE = 'umf_snapshot_live';
const DOC_LATEST = 'latest';
const COLLECTION_HISTORY = 'umf_snapshot_history';

/**
 * Initialize Firebase for server-side use
 * 
 * Only initializes if no app exists (singleton pattern).
 */
let db: Firestore;

function initializeFirestore(): Firestore {
  if (!db) {
    // Check if Firebase app already initialized
    const existingApps = getApps();
    
    if (existingApps.length === 0) {
      // Initialize new app
      const app = initializeApp(firebaseConfig, 'umf-server');
      db = getFirestore(app);
    } else {
      // Reuse existing app
      db = getFirestore(existingApps[0]);
    }
  }
  
  return db;
}

/**
 * Write Live Snapshot to Firestore
 * 
 * Writes the current snapshot to umf_snapshot_live/latest.
 * Overwrites any existing document (set operation).
 * 
 * Validation:
 * - Validates snapshot with Zod schema before writing
 * - Throws error if validation fails
 * 
 * @param snapshot - UmfSnapshot to write
 * @throws Error if validation fails or Firestore write fails
 * 
 * @example
 * ```typescript
 * const snapshot = {
 *   timestamp_utc: '2025-11-07T10:00:00.000Z',
 *   assets: [...],
 *   degraded: false,
 * };
 * 
 * await writeLiveSnapshot(snapshot);
 * console.log('Live snapshot updated');
 * ```
 */
export async function writeLiveSnapshot(snapshot: UmfSnapshotLive): Promise<void> {
  // Validate with Zod before writing
  const validated = umfSnapshotLiveSchema.parse(snapshot);
  
  // Initialize Firestore
  const firestore = initializeFirestore();
  
  // Write to umf_snapshot_live/latest
  const docRef = doc(firestore, COLLECTION_LIVE, DOC_LATEST);
  await setDoc(docRef, validated);
}

/**
 * Append History Snapshot to Firestore
 * 
 * Appends a snapshot to umf_snapshot_history with server timestamp.
 * Document ID is the snapshot's timestamp_utc (ISO 8601).
 * 
 * Server Timestamp:
 * - Adds 'written_at_utc' field with Firestore server timestamp
 * - Ensures consistent ordering for trimHistory
 * 
 * Validation:
 * - Validates snapshot with Zod schema before writing
 * - Throws error if validation fails
 * 
 * @param snapshot - UmfSnapshot to append to history
 * @throws Error if validation fails or Firestore write fails
 * 
 * @example
 * ```typescript
 * const snapshot = {
 *   timestamp_utc: '2025-11-07T10:00:00.000Z',
 *   assets: [...],
 *   degraded: false,
 * };
 * 
 * await appendHistorySnapshot(snapshot);
 * console.log('History snapshot appended');
 * ```
 */
export async function appendHistorySnapshot(snapshot: UmfSnapshotLive): Promise<void> {
  // Validate with Zod before writing
  const validated = umfSnapshotLiveSchema.parse(snapshot);
  
  // Initialize Firestore
  const firestore = initializeFirestore();
  
  // Use snapshot timestamp as document ID
  const docId = validated.timestamp_utc;
  
  // Add server timestamp for consistent ordering
  const historyDoc = {
    ...validated,
    written_at_utc: serverTimestamp(),
  };
  
  // Write to umf_snapshot_history/{timestamp}
  const docRef = doc(firestore, COLLECTION_HISTORY, docId);
  await setDoc(docRef, historyDoc);
}

/**
 * Read Live Snapshot from Firestore
 * 
 * Reads the current snapshot from umf_snapshot_live/latest.
 * Returns null if document doesn't exist.
 * 
 * Validation:
 * - Validates with Zod schema after reading
 * - Throws error if validation fails
 * 
 * @returns Promise resolving to UmfSnapshot or null if not found
 * @throws Error if validation fails or Firestore read fails
 * 
 * @example
 * ```typescript
 * const snapshot = await readLiveSnapshot();
 * if (snapshot) {
 *   console.log('Snapshot found:', snapshot.assets.length, 'assets');
 * } else {
 *   console.log('No snapshot available');
 * }
 * ```
 */
export async function readLiveSnapshot(): Promise<UmfSnapshotLive | null> {
  // Initialize Firestore
  const firestore = initializeFirestore();
  
  // Read from umf_snapshot_live/latest
  const docRef = doc(firestore, COLLECTION_LIVE, DOC_LATEST);
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
}

/**
 * Trim History Snapshots
 * 
 * Deletes oldest snapshots beyond maxDocs count.
 * Keeps the most recent maxDocs snapshots based on written_at_utc.
 * 
 * Algorithm:
 * 1. Count total documents in history
 * 2. If count > maxDocs, delete (count - maxDocs) oldest
 * 3. Query ordered by written_at_utc ascending
 * 4. Delete oldest documents first
 * 
 * @param maxDocs - Maximum number of history snapshots to keep
 * @returns Promise resolving to number of deleted documents
 * 
 * @example
 * ```typescript
 * // Keep only 48 most recent snapshots
 * const deleted = await trimHistory(48);
 * console.log(`Deleted ${deleted} old snapshots`);
 * ```
 */
export async function trimHistory(maxDocs: number): Promise<number> {
  // Initialize Firestore
  const firestore = initializeFirestore();
  
  // Get all history documents ordered by written_at_utc ascending (oldest first)
  const historyRef = collection(firestore, COLLECTION_HISTORY);
  const allDocsQuery = query(historyRef, orderBy('written_at_utc', 'asc'));
  const allDocsSnap = await getDocs(allDocsQuery);
  
  const totalDocs = allDocsSnap.size;
  
  // Calculate how many to delete
  const toDelete = totalDocs - maxDocs;
  
  if (toDelete <= 0) {
    // Nothing to delete
    return 0;
  }
  
  // Delete oldest documents
  let deletedCount = 0;
  const deletePromises: Promise<void>[] = [];
  
  allDocsSnap.docs.slice(0, toDelete).forEach((docSnap) => {
    const docRef = doc(firestore, COLLECTION_HISTORY, docSnap.id);
    deletePromises.push(deleteDoc(docRef));
    deletedCount++;
  });
  
  // Execute all deletes in parallel
  await Promise.all(deletePromises);
  
  return deletedCount;
}

/**
 * Get History Count
 * 
 * Returns the total number of history snapshots in Firestore.
 * Useful for monitoring and debugging.
 * 
 * @returns Promise resolving to number of history documents
 * 
 * @example
 * ```typescript
 * const count = await getHistoryCount();
 * console.log(`History contains ${count} snapshots`);
 * ```
 */
export async function getHistoryCount(): Promise<number> {
  // Initialize Firestore
  const firestore = initializeFirestore();
  
  // Get all history documents
  const historyRef = collection(firestore, COLLECTION_HISTORY);
  const allDocsSnap = await getDocs(historyRef);
  
  return allDocsSnap.size;
}
