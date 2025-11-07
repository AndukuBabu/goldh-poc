/**
 * UMF (Universal Market Financials) TanStack Query Hooks
 * 
 * React hooks for fetching and managing UMF data with automatic caching,
 * refetching, and loading states via TanStack Query.
 * 
 * Hooks:
 * - useUmfSnapshot() - Market snapshot with all tracked assets
 * - useUmfMovers() - Top gainers and losers
 * - useUmfBrief() - Daily Morning Intelligence brief
 * - useUmfAlerts() - Active market alerts
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
  getUmfMovers,
  getUmfBriefToday,
  getUmfAlerts,
  type UmfSnapshot,
  type UmfMover,
  type UmfBrief,
  type UmfAlert,
} from "@/lib/umf";
import type { UmfAsset } from "@shared/schema";

/**
 * Hook: Fetch Latest Market Snapshot
 * 
 * Fetches all tracked assets (Top-20 crypto, indices, forex, commodities)
 * with automatic caching and background refetching.
 * 
 * Cache Strategy:
 * - staleTime: 30 seconds (data considered fresh for 30s)
 * - refetchInterval: 60 seconds (background refresh every minute)
 * - cacheTime: 5 minutes (cached data persists for 5 min after unmount)
 * 
 * @returns TanStack Query result with UmfSnapshot data
 * 
 * @example
 * ```tsx
 * function MarketOverview() {
 *   const { data: snapshot, isLoading, error } = useUmfSnapshot();
 *   
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <Error message={error.message} />;
 *   
 *   return (
 *     <div>
 *       <h2>Market Snapshot</h2>
 *       <p>{snapshot.assets.length} assets tracked</p>
 *       {snapshot.assets.map(asset => (
 *         <AssetRow key={asset.id} asset={asset} />
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUmfSnapshot() {
  return useQuery<UmfSnapshot, Error>({
    queryKey: ['/features/umf/snapshot'],
    queryFn: getUmfSnapshotLatest,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2, // Retry failed requests twice
  });
}

/**
 * Hook: Fetch Top Movers (Gainers & Losers)
 * 
 * Fetches the top performing and worst performing assets in the last 24 hours.
 * Typically returns 5 gainers + 5 losers = 10 total movers.
 * 
 * Cache Strategy:
 * - staleTime: 30 seconds
 * - refetchInterval: 60 seconds
 * - cacheTime: 5 minutes
 * 
 * @returns TanStack Query result with UmfMover[] data
 * 
 * @example
 * ```tsx
 * function TopMovers() {
 *   const { data: movers, isLoading } = useUmfMovers();
 *   
 *   const gainers = movers?.filter(m => m.direction === 'gainer') || [];
 *   const losers = movers?.filter(m => m.direction === 'loser') || [];
 *   
 *   return (
 *     <div>
 *       <GainersCard data={gainers} />
 *       <LosersCard data={losers} />
 *     </div>
 *   );
 * }
 * ```
 */
export function useUmfMovers() {
  return useQuery<UmfMover[], Error>({
    queryKey: ['/features/umf/movers'],
    queryFn: () => getUmfMovers(10),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 2,
  });
}

/**
 * Hook: Fetch Today's Morning Intelligence Brief
 * 
 * Fetches the AI-generated daily market brief with headline and key insights.
 * This data changes once per day, so longer cache times are appropriate.
 * 
 * Cache Strategy:
 * - staleTime: 5 minutes (briefs update once daily)
 * - refetchInterval: 15 minutes
 * - cacheTime: 30 minutes
 * 
 * @returns TanStack Query result with UmfBrief data
 * 
 * @example
 * ```tsx
 * function MorningIntelligence() {
 *   const { data: brief, isLoading } = useUmfBrief();
 *   
 *   if (isLoading) return <Skeleton />;
 *   
 *   return (
 *     <Card>
 *       <h3>{brief.headline}</h3>
 *       <ul>
 *         {brief.bullets.map((bullet, i) => (
 *           <li key={i}>{bullet}</li>
 *         ))}
 *       </ul>
 *     </Card>
 *   );
 * }
 * ```
 */
export function useUmfBrief() {
  return useQuery<UmfBrief, Error>({
    queryKey: ['/features/umf/brief'],
    queryFn: getUmfBriefToday,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: 15 * 60 * 1000, // Refetch every 15 minutes
    retry: 2,
  });
}

/**
 * Hook: Fetch Active Market Alerts
 * 
 * Fetches up to 3 active market alerts for significant price movements,
 * volatility spikes, or sentiment shifts.
 * 
 * Cache Strategy:
 * - staleTime: 30 seconds
 * - refetchInterval: 60 seconds
 * - cacheTime: 5 minutes
 * 
 * @returns TanStack Query result with UmfAlert[] data
 * 
 * @example
 * ```tsx
 * function AlertsWidget() {
 *   const { data: alerts = [] } = useUmfAlerts();
 *   
 *   if (alerts.length === 0) return null;
 *   
 *   return (
 *     <div>
 *       {alerts.map(alert => (
 *         <Alert key={alert.id} severity={alert.severity}>
 *           <h4>{alert.title}</h4>
 *           <p>{alert.body}</p>
 *         </Alert>
 *       ))}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUmfAlerts() {
  return useQuery<UmfAlert[], Error>({
    queryKey: ['/features/umf/alerts'],
    queryFn: () => getUmfAlerts(3),
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
  const { data: snapshot, ...queryState } = useUmfSnapshot();
  
  const topCrypto = snapshot?.assets
    .filter((asset): asset is UmfAsset & { marketCap: number } => 
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
  const { data: snapshot, ...queryState } = useUmfSnapshot();
  
  const indices = snapshot?.assets.filter(asset => asset.class === 'index');
  
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
  const { data: snapshot, ...queryState } = useUmfSnapshot();
  
  const dxy = snapshot?.assets.find(
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
  const { data: snapshot, ...queryState } = useUmfSnapshot();
  
  const btc = snapshot?.assets.find(
    asset => asset.symbol === 'BTC' || asset.id === 'btc-usd'
  );
  
  const eth = snapshot?.assets.find(
    asset => asset.symbol === 'ETH' || asset.id === 'eth-usd'
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
  const { data: snapshot, ...queryState } = useUmfSnapshot();
  
  const asset = snapshot?.assets.find(
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
  const { data: snapshot, ...queryState } = useUmfSnapshot();
  
  const assets = snapshot?.assets.filter(asset => asset.class === assetClass);
  
  return {
    data: assets,
    ...queryState,
  };
}
