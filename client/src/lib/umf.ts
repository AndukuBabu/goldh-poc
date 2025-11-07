/**
 * UMF (Universal Market Financials) Client Data Layer
 * 
 * Firestore data readers for the UMF feature (MVP Phase).
 * All functions fetch mock data from Firestore collections and validate with Zod.
 * 
 * MVP Architecture:
 *   getUmfSnapshotLatest() → Firestore → umf_snapshot_mock collection
 *   getUmfMovers() → Firestore → umf_movers_mock collection
 *   getUmfBriefToday() → Firestore → umf_brief_mock collection
 *   getUmfAlerts() → Firestore → umf_alerts_mock collection
 * 
 * Future (Phase 2):
 *   All functions will be replaced with API calls to /api/umf/* endpoints
 *   UI components remain unchanged (they only consume typed data)
 *   TanStack Query hooks abstract the data source
 * 
 * Migration Path:
 * 1. Create backend endpoints: GET /api/umf/snapshot, /movers, /brief, /alerts
 * 2. Replace Firestore calls with fetch() to API endpoints
 * 3. UI components remain unchanged
 * 4. Remove Firestore imports and Firebase dependency
 * 
 * @see docs/UMF-UI-MVP.md for full specification
 * @see shared/schema.ts for UMF type definitions
 */

import { db } from "./firebase";
import { collection, doc, getDoc, getDocs, query, limit, orderBy } from "firebase/firestore";
import { 
  umfSnapshotSchema, 
  umfMoverSchema, 
  umfBriefSchema, 
  umfAlertSchema,
  type UmfSnapshot,
  type UmfMover,
  type UmfBrief,
  type UmfAlert,
} from "@shared/schema";

// Re-export UMF types for external consumers
export type { UmfSnapshot, UmfMover, UmfBrief, UmfAlert };

/**
 * Error handling wrapper for Firestore operations
 * Normalizes Firebase errors into user-friendly messages
 */
function handleFirestoreError(error: unknown, context: string): Error {
  console.error(`[UMF] ${context}:`, error);
  
  if (error instanceof Error) {
    // Firebase permission errors
    if (error.message.includes('permission-denied')) {
      return new Error(`Unable to access ${context}: Permission denied`);
    }
    
    // Firebase network errors
    if (error.message.includes('network') || error.message.includes('NETWORK')) {
      return new Error(`Unable to fetch ${context}: Network error. Please check your connection.`);
    }
    
    // Generic Firebase errors
    return new Error(`Failed to fetch ${context}: ${error.message}`);
  }
  
  return new Error(`Failed to fetch ${context}: Unknown error`);
}

/**
 * Normalize timestamps to UTC ISO 8601 format
 * Handles Firestore Timestamp objects and Date objects
 */
function normalizeTimestamp(timestamp: any): string {
  if (!timestamp) {
    return new Date().toISOString();
  }
  
  // Firestore Timestamp object
  if (timestamp.toDate && typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  
  // Date object
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  
  // Already a string (ISO format)
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  
  // Fallback: convert to date
  return new Date(timestamp).toISOString();
}

/**
 * Get Latest Market Snapshot
 * 
 * Fetches the most recent market snapshot containing all tracked assets
 * (Top-20 crypto, major indices, forex, commodities).
 * 
 * MVP: Reads from Firestore collection 'umf_snapshot_mock' (document ID: 'current')
 * Future: GET /api/umf/snapshot
 * 
 * @returns Promise<UmfSnapshot> - Latest market snapshot with all assets
 * @throws Error - If fetch fails or data validation fails
 * 
 * @example
 * ```typescript
 * const snapshot = await getUmfSnapshotLatest();
 * console.log(`Loaded ${snapshot.assets.length} assets`);
 * snapshot.assets.forEach(asset => {
 *   console.log(`${asset.symbol}: $${asset.price} (${asset.changePct24h}%)`);
 * });
 * ```
 */
export async function getUmfSnapshotLatest(): Promise<UmfSnapshot> {
  try {
    const docRef = doc(db, "umf_snapshot_mock", "current");
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('No market snapshot available');
    }
    
    const data = docSnap.data();
    
    // Normalize timestamp
    if (data.timestamp_utc) {
      data.timestamp_utc = normalizeTimestamp(data.timestamp_utc);
    }
    
    // Normalize asset timestamps
    if (data.assets && Array.isArray(data.assets)) {
      data.assets = data.assets.map((asset: any) => ({
        ...asset,
        updatedAt_utc: normalizeTimestamp(asset.updatedAt_utc),
      }));
    }
    
    // Validate with Zod schema
    const validatedSnapshot = umfSnapshotSchema.parse(data);
    
    return validatedSnapshot;
    
  } catch (error) {
    throw handleFirestoreError(error, 'market snapshot');
  }
}

/**
 * Get Top Movers (Gainers & Losers)
 * 
 * Fetches the top performing and worst performing assets in the last 24 hours.
 * Typically returns top 5 gainers + top 5 losers = 10 total movers.
 * 
 * MVP: Reads from Firestore collection 'umf_movers_mock' (limit 10)
 * Future: GET /api/umf/movers?limit=10
 * 
 * @param maxMovers - Maximum number of movers to return (default: 10)
 * @returns Promise<UmfMover[]> - Array of top gainers and losers
 * @throws Error - If fetch fails or data validation fails
 * 
 * @example
 * ```typescript
 * const movers = await getUmfMovers();
 * const gainers = movers.filter(m => m.direction === 'gainer');
 * const losers = movers.filter(m => m.direction === 'loser');
 * 
 * console.log('Top Gainers:');
 * gainers.forEach(g => console.log(`${g.symbol}: +${g.changePct24h}%`));
 * ```
 */
export async function getUmfMovers(maxMovers: number = 10): Promise<UmfMover[]> {
  try {
    const moversRef = collection(db, "umf_movers_mock");
    const q = query(moversRef, limit(maxMovers));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.warn('[UMF] No movers data available, returning empty array');
      return [];
    }
    
    // Map documents to UmfMover objects
    const movers: UmfMover[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      
      // Normalize timestamp
      if (data.updatedAt_utc) {
        data.updatedAt_utc = normalizeTimestamp(data.updatedAt_utc);
      }
      
      return data as UmfMover;
    });
    
    // Validate each mover with Zod schema
    const validatedMovers = movers.map((mover, index) => {
      try {
        return umfMoverSchema.parse(mover);
      } catch (validationError) {
        console.error(`[UMF] Mover validation failed at index ${index}:`, validationError);
        throw new Error(`Invalid mover data at position ${index}`);
      }
    });
    
    return validatedMovers;
    
  } catch (error) {
    throw handleFirestoreError(error, 'top movers');
  }
}

/**
 * Get Today's Morning Intelligence Brief
 * 
 * Fetches the AI-generated daily market brief with headline and key insights.
 * Returns today's brief or the most recent brief if today's is not available.
 * 
 * MVP: Reads from Firestore collection 'umf_brief_mock' (document ID: 'today')
 * Future: GET /api/umf/brief?date=today
 * 
 * @returns Promise<UmfBrief> - Today's morning intelligence brief
 * @throws Error - If fetch fails or data validation fails
 * 
 * @example
 * ```typescript
 * const brief = await getUmfBriefToday();
 * console.log('Morning Intelligence:');
 * console.log(brief.headline);
 * brief.bullets.forEach((bullet, i) => {
 *   console.log(`${i + 1}. ${bullet}`);
 * });
 * ```
 */
export async function getUmfBriefToday(): Promise<UmfBrief> {
  try {
    const docRef = doc(db, "umf_brief_mock", "today");
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('No morning brief available for today');
    }
    
    const data = docSnap.data();
    
    // Ensure date is in YYYY-MM-DD format
    if (data.date_utc && typeof data.date_utc === 'object' && data.date_utc.toDate) {
      // Firestore Timestamp to YYYY-MM-DD
      const date = data.date_utc.toDate();
      data.date_utc = date.toISOString().split('T')[0];
    } else if (!data.date_utc || typeof data.date_utc !== 'string') {
      // Default to today if missing
      data.date_utc = new Date().toISOString().split('T')[0];
    }
    
    // Validate with Zod schema
    const validatedBrief = umfBriefSchema.parse(data);
    
    return validatedBrief;
    
  } catch (error) {
    throw handleFirestoreError(error, 'morning brief');
  }
}

/**
 * Get Active Market Alerts
 * 
 * Fetches up to 3 active market alerts for significant price movements,
 * volatility spikes, or sentiment shifts.
 * 
 * MVP: Reads from Firestore collection 'umf_alerts_mock' (limit 3, ordered by severity)
 * Future: GET /api/umf/alerts?limit=3&active=true
 * 
 * @param maxAlerts - Maximum number of alerts to return (default: 3)
 * @returns Promise<UmfAlert[]> - Array of active alerts (empty if none)
 * @throws Error - If fetch fails or data validation fails
 * 
 * @example
 * ```typescript
 * const alerts = await getUmfAlerts();
 * if (alerts.length > 0) {
 *   console.log(`You have ${alerts.length} active alerts:`);
 *   alerts.forEach(alert => {
 *     console.log(`[${alert.severity.toUpperCase()}] ${alert.title}`);
 *     console.log(`  ${alert.body}`);
 *   });
 * }
 * ```
 */
export async function getUmfAlerts(maxAlerts: number = 3): Promise<UmfAlert[]> {
  try {
    const alertsRef = collection(db, "umf_alerts_mock");
    
    // Order by severity (high > warn > info) and limit results
    // Note: Firestore orders strings alphabetically, so 'high' < 'info' < 'warn'
    // We'll sort client-side instead
    const q = query(alertsRef, limit(maxAlerts));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      console.info('[UMF] No active alerts, returning empty array');
      return [];
    }
    
    // Map documents to UmfAlert objects
    const alerts: UmfAlert[] = snapshot.docs.map(docSnap => {
      const data = docSnap.data();
      
      // Normalize timestamp
      if (data.createdAt_utc) {
        data.createdAt_utc = normalizeTimestamp(data.createdAt_utc);
      }
      
      return {
        id: docSnap.id,
        ...data,
      } as UmfAlert;
    });
    
    // Validate each alert with Zod schema
    const validatedAlerts = alerts.map((alert, index) => {
      try {
        return umfAlertSchema.parse(alert);
      } catch (validationError) {
        console.error(`[UMF] Alert validation failed at index ${index}:`, validationError);
        throw new Error(`Invalid alert data at position ${index}`);
      }
    });
    
    // Sort by severity: high > warn > info
    const severityOrder: Record<string, number> = {
      high: 0,
      warn: 1,
      info: 2,
    };
    
    validatedAlerts.sort((a, b) => 
      severityOrder[a.severity] - severityOrder[b.severity]
    );
    
    return validatedAlerts.slice(0, maxAlerts);
    
  } catch (error) {
    throw handleFirestoreError(error, 'market alerts');
  }
}

/**
 * Utility: Get UMF Data Summary
 * 
 * Fetches all UMF data in parallel for dashboard initialization.
 * This is a convenience function that calls all data fetchers at once.
 * 
 * @returns Promise<{ snapshot, movers, brief, alerts }> - All UMF data
 * @throws Error - If any fetch fails
 * 
 * @example
 * ```typescript
 * const { snapshot, movers, brief, alerts } = await getUmfDataSummary();
 * console.log('UMF Dashboard loaded:');
 * console.log(`- ${snapshot.assets.length} assets`);
 * console.log(`- ${movers.length} top movers`);
 * console.log(`- Brief: ${brief.headline}`);
 * console.log(`- ${alerts.length} active alerts`);
 * ```
 */
export async function getUmfDataSummary() {
  try {
    const [snapshot, movers, brief, alerts] = await Promise.all([
      getUmfSnapshotLatest(),
      getUmfMovers(),
      getUmfBriefToday(),
      getUmfAlerts(),
    ]);
    
    return {
      snapshot,
      movers,
      brief,
      alerts,
    };
  } catch (error) {
    throw handleFirestoreError(error, 'UMF data summary');
  }
}
