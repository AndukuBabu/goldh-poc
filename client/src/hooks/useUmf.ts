/**
 * UMF (Universal Market Financials) TanStack Query Hooks
 * 
 * React hooks for fetching and managing UMF data with automatic caching,
 * refetching, and loading states via TanStack Query.
 * 
 * Hooks:
 * - useUmfSnapshot() - Market snapshot with all tracked assets
 * - useUmfMovers() - Top gainers and losers
 * 
 * Derived Selectors:
 * - useCryptoByMarketCap() - Top crypto sorted by market cap
 * - useIndices() - Major stock indices (SPX, NDX)
 * - useDXY() - US Dollar Index
 * - useBtcEth() - Bitcoin and Ethereum quick refs
 * 
 * @see client/src/lib/umf.ts for data fetching functions
 * @see docs/UMF-UI-MVP.md for feature specification
 */

import { useQuery } from "@tanstack/react-query";
import { 
  getUmfSnapshotLatest,
  getUmfMovers as getUmfMoversMock,
  type UmfSnapshot,
  type UmfMover,
} from "@/lib/umf";
import { getUmfSnapshotLive } from "@/lib/umf_firestore";
import type { UmfAsset, UmfSnapshotLive, UmfAssetLive } from "@shared/schema";

/**
 * Extended Snapshot Response
 * 
 * Includes metadata about data source and age for UI transparency.
 */
export interface UmfSnapshotExtended {
  data: UmfSnapshotLive;
  degraded: boolean;
  sourceUi: 'Live' | 'Firestore' | 'Mock';
  ageMinutes: number;
}

/**
 * Hook: Fetch Latest Market Snapshot
 * 
 * Fetches all tracked assets with multi-tier fallback:
 * 1. API route (/api/umf/snapshot) - tries cache → Firestore → empty
 * 2. Direct Firestore (client SDK) - if API returns empty
 * 3. Mock data (Firestore) - if all else fails
 * 
 * Returns extended data with source transparency and age calculation.
 * 
 * Cache Strategy:
 * - staleTime: 30 seconds (data considered fresh for 30s)
 * - refetchInterval: 60 seconds (background refresh every minute)
 * - gcTime: 5 minutes (cached data persists for 5 min after unmount)
 * 
 * @returns TanStack Query result with UmfSnapshotExtended
 * 
 * @example
 * ```tsx
 * function MarketOverview() {
 *   const { data, isLoading, error } = useUmfSnapshot();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <Error message={error.message} />;
 *   
 *   const { data: snapshot, degraded, sourceUi, ageMinutes } = data;
 *   
 *   return (
 *     <div>
 *       <h2>Market Snapshot</h2>
 *       <Badge>{sourceUi}</Badge>
 *       {degraded && <Badge variant="warn">Degraded</Badge>}
 *       <p>Data age: {ageMinutes.toFixed(1)} minutes</p>
 *       {snapshot.assets.map(asset => (
 *         <AssetRow key={asset.id} asset={asset} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUmfSnapshot() {
  return useQuery<UmfSnapshotExtended, Error>({
    queryKey: ['/api/umf/snapshot'],
    queryFn: async () => {
      let snapshot: UmfSnapshotLive | null = null;
      let source: 'cache' | 'firestore' | 'empty' | 'mock' = 'empty';
      let degraded = true;
      
      // Step 1: Try API route first
      try {
        const response = await fetch('/api/umf/snapshot');
        
        if (response.ok) {
          // Read x-umf-source header
          const headerSource = response.headers.get('x-umf-source') as 'cache' | 'firestore' | 'empty' | null;
          source = headerSource || 'empty';
          
          const data = await response.json();
          
          // Check if we got actual data (not empty fallback)
          if (data.assets && data.assets.length > 0) {
            snapshot = data;
            degraded = data.degraded || false;
          }
        }
      } catch (error) {
        console.warn('[useUmfSnapshot] API route failed:', error);
      }
      
      // Step 2: If API returned empty, try direct Firestore
      if (!snapshot || snapshot.assets.length === 0) {
        try {
          const firestoreSnapshot = await getUmfSnapshotLive();
          
          if (firestoreSnapshot && firestoreSnapshot.assets.length > 0) {
            snapshot = firestoreSnapshot;
            source = 'firestore';
            degraded = true; // Direct Firestore = degraded
          }
        } catch (error) {
          console.warn('[useUmfSnapshot] Direct Firestore failed:', error);
        }
      }
      
      // Step 3: If still empty, fallback to mock
      if (!snapshot || snapshot.assets.length === 0) {
        try {
          const mockSnapshot = await getUmfSnapshotLatest();
          
          snapshot = {
            timestamp_utc: mockSnapshot.timestamp_utc,
            assets: mockSnapshot.assets as UmfAssetLive[], // Cast to live schema
            degraded: true,
          };
          source = 'mock';
          degraded = true;
        } catch (error) {
          console.error('[useUmfSnapshot] All data sources failed:', error);
          throw new Error('Failed to fetch market snapshot from all sources');
        }
      }
      
      // Compute age in minutes
      const ageMinutes = (Date.now() - new Date(snapshot.timestamp_utc).getTime()) / 60000;
      
      // Map source to UI-friendly label
      const sourceUi: 'Live' | 'Firestore' | 'Mock' = 
        source === 'cache' ? 'Live' :
        source === 'firestore' ? 'Firestore' :
        'Mock';
      
      return {
        data: snapshot,
        degraded,
        sourceUi,
        ageMinutes,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2,
  });
}

/**
 * Extended Movers Response
 * 
 * Includes metadata about data source for UI transparency.
 */
export interface UmfMoversExtended {
  gainers: UmfAssetLive[];
  losers: UmfAssetLive[];
  degraded: boolean;
  sourceUi: 'Live' | 'Firestore' | 'Mock';
}

/**
 * Hook: Fetch Top Movers (Gainers & Losers)
 * 
 * Fetches top performing and worst performing assets with multi-tier fallback:
 * 1. API route (/api/umf/movers) - server-computed movers
 * 2. Compute from snapshot - if API returns empty
 * 3. Mock data - if all else fails
 * 
 * Returns top 5 gainers and top 5 losers with source transparency.
 * 
 * Cache Strategy:
 * - staleTime: 30 seconds
 * - refetchInterval: 60 seconds
 * - gcTime: 5 minutes
 * 
 * @returns TanStack Query result with UmfMoversExtended
 * 
 * @example
 * ```tsx
 * function TopMovers() {
 *   const { data, isLoading } = useUmfMovers();
 *   
 *   if (isLoading) return <Skeleton />;
 *   
 *   const { gainers, losers, degraded, sourceUi } = data;
 *   
 *   return (
 *     <div>
 *       <Badge>{sourceUi}</Badge>
 *       {degraded && <Badge variant="warn">Degraded</Badge>}
 *       <GainersCard data={gainers} />
 *       <LosersCard data={losers} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useUmfMovers() {
  return useQuery<UmfMoversExtended, Error>({
    queryKey: ['/api/umf/movers'],
    queryFn: async () => {
      let gainers: UmfAssetLive[] = [];
      let losers: UmfAssetLive[] = [];
      let source: 'cache' | 'firestore' | 'empty' | 'mock' = 'empty';
      let degraded = true;
      
      // Step 1: Try API route first
      try {
        const response = await fetch('/api/umf/movers');
        
        if (response.ok) {
          // Read x-umf-source header
          const headerSource = response.headers.get('x-umf-source') as 'cache' | 'firestore' | 'empty' | null;
          source = headerSource || 'empty';
          
          const data = await response.json();
          
          // Check if we got actual data (not empty fallback)
          if (data.gainers && data.gainers.length > 0) {
            gainers = data.gainers;
            losers = data.losers || [];
            degraded = data.degraded || false;
          }
        }
      } catch (error) {
        console.warn('[useUmfMovers] API route failed:', error);
      }
      
      // Step 2: If API returned empty, compute from snapshot
      if (gainers.length === 0) {
        try {
          // Try getting snapshot from API first
          const snapshotResponse = await fetch('/api/umf/snapshot');
          let snapshot: UmfSnapshotLive | null = null;
          
          if (snapshotResponse.ok) {
            const snapshotData = await snapshotResponse.json();
            if (snapshotData.assets && snapshotData.assets.length > 0) {
              snapshot = snapshotData;
            }
          }
          
          // If snapshot API failed, try direct Firestore
          if (!snapshot) {
            snapshot = await getUmfSnapshotLive();
          }
          
          if (snapshot && snapshot.assets.length > 0) {
            // Compute movers from snapshot
            const assetsWithChange = snapshot.assets.filter(
              (asset) => asset.changePct24h !== null
            );
            
            const sorted = [...assetsWithChange].sort(
              (a, b) => (b.changePct24h || 0) - (a.changePct24h || 0)
            );
            
            gainers = sorted.slice(0, 5);
            losers = sorted.slice(-5).reverse();
            source = 'firestore';
            degraded = true;
          }
        } catch (error) {
          console.warn('[useUmfMovers] Snapshot fallback failed:', error);
        }
      }
      
      // Step 3: If still empty, fallback to mock
      if (gainers.length === 0) {
        try {
          const mockMovers = await getUmfMoversMock(10);
          
          // Convert UmfMover[] to gainers/losers format
          gainers = mockMovers
            .filter(m => m.direction === 'gainer')
            .map(m => ({
              id: m.symbol.toLowerCase(),
              symbol: m.symbol,
              name: m.name,
              class: m.class,
              price: m.price,
              changePct24h: m.changePct24h,
              volume24h: null,
              marketCap: null,
              updatedAt_utc: m.updatedAt_utc,
            }));
          
          losers = mockMovers
            .filter(m => m.direction === 'loser')
            .map(m => ({
              id: m.symbol.toLowerCase(),
              symbol: m.symbol,
              name: m.name,
              class: m.class,
              price: m.price,
              changePct24h: m.changePct24h,
              volume24h: null,
              marketCap: null,
              updatedAt_utc: m.updatedAt_utc,
            }));
          
          source = 'mock';
          degraded = true;
        } catch (error) {
          console.error('[useUmfMovers] All data sources failed:', error);
          throw new Error('Failed to fetch market movers from all sources');
        }
      }
      
      // Map source to UI-friendly label
      const sourceUi: 'Live' | 'Firestore' | 'Mock' = 
        source === 'cache' ? 'Live' :
        source === 'firestore' ? 'Firestore' :
        'Mock';
      
      return {
        gainers,
        losers,
        degraded,
        sourceUi,
      };
    },
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2,
  });
}

// ═══════════════════════════════════════════════════════════════════════
// DERIVED SELECTORS
// ═══════════════════════════════════════════════════════════════════════

/**
 * Derived Selector: Top Crypto by Market Cap
 * 
 * Filters and sorts crypto assets by market capitalization.
 * Returns only assets with non-null market cap values.
 * 
 * @param limit - Maximum number of crypto to return (default: 20)
 * @returns TanStack Query result with sorted crypto assets
 * 
 * @example
 * ```tsx
 * function TopCrypto() {
 *   const { data: topCrypto = [] } = useCryptoByMarketCap(10);
 *   
 *   return (
 *     <div>
 *       <h3>Top 10 Crypto by Market Cap</h3>
 *       {topCrypto.map((asset, idx) => (
 *         <div key={asset.id}>
 *           #{idx + 1} {asset.name} - ${asset.marketCap?.toLocaleString()}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useCryptoByMarketCap(limit: number = 20) {
  const { data: extended, ...queryState } = useUmfSnapshot();
  
  const topCrypto = extended?.data.assets
    .filter((asset): asset is UmfAssetLive & { marketCap: number } => 
      asset.class === 'crypto' && asset.marketCap !== null
    )
    .sort((a, b) => b.marketCap - a.marketCap)
    .slice(0, limit);
  
  return {
    data: topCrypto,
    ...queryState,
  };
}

/**
 * Derived Selector: Major Stock Indices
 * 
 * Filters assets to return only stock indices (SPX, NDX, etc.).
 * 
 * @returns TanStack Query result with index assets
 * 
 * @example
 * ```tsx
 * function IndicesWidget() {
 *   const { data: indices = [] } = useIndices();
 *   
 *   return (
 *     <div>
 *       {indices.map(index => (
 *         <div key={index.id}>
 *           {index.symbol}: {index.price} ({index.changePct24h > 0 ? '+' : ''}{index.changePct24h}%)
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useIndices() {
  const { data: extended, ...queryState } = useUmfSnapshot();
  
  const indices = extended?.data.assets.filter(asset => asset.class === 'index');
  
  return {
    data: indices,
    ...queryState,
  };
}

/**
 * Derived Selector: US Dollar Index (DXY)
 * 
 * Finds and returns the DXY (US Dollar Index) asset from the snapshot.
 * 
 * @returns TanStack Query result with DXY asset (or undefined if not found)
 * 
 * @example
 * ```tsx
 * function DollarIndexWidget() {
 *   const { data: dxy, isLoading } = useDXY();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (!dxy) return <div>DXY not available</div>;
 *   
 *   return (
 *     <Card>
 *       <h4>US Dollar Index</h4>
 *       <div className="text-2xl">{dxy.price.toFixed(2)}</div>
 *       <div className={dxy.changePct24h > 0 ? 'text-green' : 'text-red'}>
 *         {dxy.changePct24h > 0 ? '+' : ''}{dxy.changePct24h.toFixed(2)}%
 *       </div>
 *     </Card>
 *   );
 * }
 * ```
 */
export function useDXY() {
  const { data: extended, ...queryState } = useUmfSnapshot();
  
  const dxy = extended?.data.assets.find(
    asset => asset.symbol === 'DXY' || asset.id === 'dxy'
  );
  
  return {
    data: dxy,
    ...queryState,
  };
}

/**
 * Derived Selector: Bitcoin & Ethereum Quick Refs
 * 
 * Returns BTC and ETH assets for quick access.
 * Useful for displaying these major assets prominently.
 * 
 * @returns TanStack Query result with { btc, eth } objects
 * 
 * @example
 * ```tsx
 * function MajorCryptoHeader() {
 *   const { data, isLoading } = useBtcEth();
 *   
 *   if (isLoading) return <Skeleton />;
 *   
 *   const { btc, eth } = data || {};
 *   
 *   return (
 *     <div className="flex gap-4">
 *       {btc && (
 *         <div>
 *           <span>BTC</span>
 *           <span className="text-2xl">${btc.price.toLocaleString()}</span>
 *           <span className={btc.changePct24h > 0 ? 'text-green' : 'text-red'}>
 *             {btc.changePct24h > 0 ? '+' : ''}{btc.changePct24h}%
 *           </span>
 *         </div>
 *       )}
 *       {eth && (
 *         <div>
 *           <span>ETH</span>
 *           <span className="text-2xl">${eth.price.toLocaleString()}</span>
 *           <span className={eth.changePct24h > 0 ? 'text-green' : 'text-red'}>
 *             {eth.changePct24h > 0 ? '+' : ''}{eth.changePct24h}%
 *           </span>
 *         </div>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function useBtcEth() {
  const { data: extended, ...queryState } = useUmfSnapshot();
  
  const btc = extended?.data.assets.find(
    asset => asset.symbol === 'BTC' || asset.id === 'bitcoin'
  );
  
  const eth = extended?.data.assets.find(
    asset => asset.symbol === 'ETH' || asset.id === 'ethereum'
  );
  
  return {
    data: { btc, eth },
    ...queryState,
  };
}

/**
 * Derived Selector: Asset by Symbol
 * 
 * Generic selector to find any asset by its symbol.
 * 
 * @param symbol - Asset symbol to find (e.g., 'BTC', 'SPX', 'GOLD')
 * @returns TanStack Query result with matching asset (or undefined)
 * 
 * @example
 * ```tsx
 * function AssetCard({ symbol }: { symbol: string }) {
 *   const { data: asset, isLoading } = useAssetBySymbol(symbol);
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (!asset) return <div>Asset not found</div>;
 *   
 *   return (
 *     <Card>
 *       <h4>{asset.name}</h4>
 *       <div>${asset.price}</div>
 *       <div>{asset.changePct24h > 0 ? '+' : ''}{asset.changePct24h}%</div>
 *     </Card>
 *   );
 * }
 * ```
 */
export function useAssetBySymbol(symbol: string) {
  const { data: extended, ...queryState } = useUmfSnapshot();
  
  const asset = extended?.data.assets.find(
    asset => asset.symbol.toLowerCase() === symbol.toLowerCase()
  );
  
  return {
    data: asset,
    ...queryState,
  };
}

/**
 * Derived Selector: Assets by Class
 * 
 * Filter assets by asset class (crypto, index, forex, commodity, etf).
 * 
 * @param assetClass - Asset class to filter by
 * @returns TanStack Query result with filtered assets
 * 
 * @example
 * ```tsx
 * function CommoditiesWidget() {
 *   const { data: commodities = [] } = useAssetsByClass('commodity');
 *   
 *   return (
 *     <div>
 *       <h3>Commodities</h3>
 *       {commodities.map(asset => (
 *         <div key={asset.id}>
 *           {asset.name}: ${asset.price}
 *         </div>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useAssetsByClass(assetClass: 'crypto' | 'index' | 'forex' | 'commodity' | 'etf') {
  const { data: extended, ...queryState } = useUmfSnapshot();
  
  const assets = extended?.data.assets.filter(asset => asset.class === assetClass);
  
  return {
    data: assets,
    ...queryState,
  };
}
