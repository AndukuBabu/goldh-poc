/**
 * UMF API Client Functions
 * 
 * These functions will replace Firestore queries when migrating to REST API.
 * 
 * Migration Steps:
 * 1. Implement server endpoints in server/routes.ts
 * 2. Uncomment and implement these client functions
 * 3. Update hooks in client/src/hooks/useUmf.ts to use these functions
 * 4. Remove Firestore dependencies
 * 
 * @see server/openapi/umf.draft.yaml for API specification
 */

import type { UmfSnapshot, UmfMover, UmfBrief, UmfAlert } from "@shared/schema";

/**
 * Fetch market snapshot with all tracked assets
 * 
 * Future endpoint: GET /api/umf/snapshot
 * 
 * @returns Promise resolving to UmfSnapshot with assets array
 * @throws Error if request fails
 */
export async function fetchUmfSnapshot(): Promise<UmfSnapshot> {
  // TODO: Implement REST API call when backend endpoints are ready
  // Example implementation:
  // const response = await fetch('/api/umf/snapshot');
  // if (!response.ok) throw new Error('Failed to fetch snapshot');
  // return response.json();
  
  throw new Error('fetchUmfSnapshot not implemented - currently using Firestore');
}

/**
 * Fetch top market movers (gainers and losers)
 * 
 * Future endpoint: GET /api/umf/movers?limit=10
 * 
 * @param limit - Number of movers to fetch (default: 10, max: 50)
 * @returns Promise resolving to array of UmfMover objects
 * @throws Error if request fails
 */
export async function fetchUmfMovers(limit = 10): Promise<UmfMover[]> {
  // TODO: Implement REST API call when backend endpoints are ready
  // Example implementation:
  // const response = await fetch(`/api/umf/movers?limit=${limit}`);
  // if (!response.ok) throw new Error('Failed to fetch movers');
  // return response.json();
  
  throw new Error('fetchUmfMovers not implemented - currently using Firestore');
}

/**
 * Fetch daily morning intelligence brief
 * 
 * Future endpoint: GET /api/umf/brief?date=YYYY-MM-DD
 * 
 * @param date - Optional date in YYYY-MM-DD format (defaults to today)
 * @returns Promise resolving to UmfBrief object
 * @throws Error if request fails or no brief available
 */
export async function fetchUmfBrief(date?: string): Promise<UmfBrief> {
  // TODO: Implement REST API call when backend endpoints are ready
  // Example implementation:
  // const dateParam = date ? `?date=${date}` : '';
  // const response = await fetch(`/api/umf/brief${dateParam}`);
  // if (!response.ok) throw new Error('Failed to fetch brief');
  // return response.json();
  
  throw new Error('fetchUmfBrief not implemented - currently using Firestore');
}

/**
 * Fetch active market alerts
 * 
 * Future endpoint: GET /api/umf/alerts?severity=info,warn,high&active=true
 * 
 * @param options - Filter options (severity levels, active status)
 * @returns Promise resolving to array of UmfAlert objects
 * @throws Error if request fails
 */
export async function fetchUmfAlerts(options?: {
  severity?: ('info' | 'warn' | 'high')[];
  activeOnly?: boolean;
}): Promise<UmfAlert[]> {
  // TODO: Implement REST API call when backend endpoints are ready
  // Example implementation:
  // const params = new URLSearchParams();
  // if (options?.severity) params.set('severity', options.severity.join(','));
  // if (options?.activeOnly) params.set('active', 'true');
  // const response = await fetch(`/api/umf/alerts?${params}`);
  // if (!response.ok) throw new Error('Failed to fetch alerts');
  // return response.json();
  
  throw new Error('fetchUmfAlerts not implemented - currently using Firestore');
}
