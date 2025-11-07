/**
 * UMF Data Adapters
 * 
 * Transforms live UMF data (with nullable fields) into UI-friendly formats
 * expected by legacy components. Centralizes migration surface and preserves
 * type safety during the transition to live data.
 * 
 * @see client/src/hooks/useUmf.ts for extended hook responses
 * @see shared/schema.ts for type definitions
 */

import type { UmfAssetLive, UmfAsset, UmfMover } from "@shared/schema";
import type { UmfSnapshotExtended, UmfMoversExtended } from "@/hooks/useUmf";

/**
 * Converts UmfSnapshotExtended to UmfAsset[] for legacy UI components
 * 
 * - Filters out assets with null changePct24h
 * - Maps UmfAssetLive to UmfAsset (removes nullability)
 * - Preserves all other fields
 * 
 * @param snapshotExtended - Extended snapshot with metadata
 * @returns Array of UI-friendly assets (only those with valid 24h changes)
 */
export function mapSnapshotExtendedToAssets(
  snapshotExtended: UmfSnapshotExtended | undefined
): UmfAsset[] {
  if (!snapshotExtended) return [];
  
  const snapshot = snapshotExtended.data;
  
  // Filter assets with valid changePct24h and map to UmfAsset
  return snapshot.assets
    .filter((asset): asset is UmfAssetLive & { changePct24h: number } => 
      asset.changePct24h !== null
    )
    .map(asset => ({
      id: asset.id,
      symbol: asset.symbol,
      name: asset.name,
      class: asset.class,
      price: asset.price,
      changePct24h: asset.changePct24h, // Guaranteed non-null by filter
      volume24h: asset.volume24h,
      marketCap: asset.marketCap,
      updatedAt_utc: asset.updatedAt_utc,
    }));
}

/**
 * Converts UmfMoversExtended to UmfMover[] for legacy UI components
 * 
 * - Combines gainers and losers into single array
 * - Adds 'direction' property based on source array
 * - Filters out movers with null changePct24h
 * - Maps UmfAssetLive to UmfMover format
 * 
 * @param moversExtended - Extended movers with metadata
 * @returns Array of UI-friendly movers with direction labels
 */
export function mapMoversExtendedToMovers(
  moversExtended: UmfMoversExtended | undefined
): UmfMover[] {
  if (!moversExtended) return [];
  
  const movers: UmfMover[] = [];
  
  // Map gainers (filter out any with null changePct24h)
  const validGainers = moversExtended.gainers
    .filter((asset): asset is UmfAssetLive & { changePct24h: number } => 
      asset.changePct24h !== null
    )
    .map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      class: asset.class,
      price: asset.price,
      changePct24h: asset.changePct24h,
      updatedAt_utc: asset.updatedAt_utc,
      direction: 'gainer' as const,
    }));
  
  // Map losers (filter out any with null changePct24h)
  const validLosers = moversExtended.losers
    .filter((asset): asset is UmfAssetLive & { changePct24h: number } => 
      asset.changePct24h !== null
    )
    .map(asset => ({
      symbol: asset.symbol,
      name: asset.name,
      class: asset.class,
      price: asset.price,
      changePct24h: asset.changePct24h,
      updatedAt_utc: asset.updatedAt_utc,
      direction: 'loser' as const,
    }));
  
  return [...validGainers, ...validLosers];
}

/**
 * Extracts metadata from UmfSnapshotExtended
 * 
 * @param snapshotExtended - Extended snapshot with metadata
 * @returns Metadata object or null if snapshot is undefined
 */
export function getSnapshotMetadata(snapshotExtended: UmfSnapshotExtended | undefined) {
  if (!snapshotExtended) return null;
  
  return {
    sourceUi: snapshotExtended.sourceUi,
    degraded: snapshotExtended.degraded,
    ageMinutes: snapshotExtended.ageMinutes,
  };
}

/**
 * Extracts metadata from UmfMoversExtended
 * 
 * @param moversExtended - Extended movers with metadata
 * @returns Metadata object or null if movers is undefined
 */
export function getMoversMetadata(moversExtended: UmfMoversExtended | undefined) {
  if (!moversExtended) return null;
  
  return {
    sourceUi: moversExtended.sourceUi,
    degraded: moversExtended.degraded,
  };
}
