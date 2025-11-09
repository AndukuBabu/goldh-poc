/**
 * UMF Market Snapshot Component
 * 
 * Displays quick stats for key assets:
 * - BTC, ETH, SOL (top crypto)
 * - SPX, NDX (major indices)
 * - DXY (US Dollar)
 * - GOLD, OIL (commodities)
 * 
 * Each tile shows: symbol, price, 24h %, sparkline placeholder
 * Enhanced with hover elevation and detailed tooltips with timestamps
 * 
 * Theming: Black-gold premium aesthetic (#0f0f0f, #1a1a1a, #2a2a2a, #C7AE6A)
 * Accessibility: Keyboard navigation, ARIA labels, icon-enhanced badges
 * 
 * @see client/src/hooks/useUmf.ts - useUmfSnapshot() hook
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, BarChart3, Clock, ArrowUp, ArrowDown } from "lucide-react";
import type { UmfAsset } from "@shared/schema";

interface UmfSnapshotProps {
  assets: UmfAsset[];
  className?: string;
}

/**
 * Priority assets to display in snapshot grid
 * Updated to show top cryptocurrencies fetched from CoinGecko
 * Note: Traditional assets (SPX, NDX, DXY, GOLD, WTI) require different data providers
 */
const PRIORITY_SYMBOLS = [
  'BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'MATIC', 
  'TRX', 'LINK', 'TON', 'DOGE', 'DOT', 'LTC',
  'NEAR', 'APT', 'AVAX'
];

export function UmfSnapshot({ assets, className }: UmfSnapshotProps) {
  // Filter to priority assets (if specified), otherwise show all
  const displayAssets = PRIORITY_SYMBOLS.length > 0
    ? assets.filter(asset => PRIORITY_SYMBOLS.includes(asset.symbol))
    : assets;

  // Sort by priority order (or market cap if not in priority list)
  const sortedAssets = displayAssets.sort((a, b) => {
    const aIndex = PRIORITY_SYMBOLS.indexOf(a.symbol);
    const bIndex = PRIORITY_SYMBOLS.indexOf(b.symbol);
    
    // Both in priority list - sort by priority
    if (aIndex !== -1 && bIndex !== -1) {
      return aIndex - bIndex;
    }
    
    // Only one in priority list - prioritized one comes first
    if (aIndex !== -1) return -1;
    if (bIndex !== -1) return 1;
    
    // Neither in priority list - sort by market cap (descending)
    return (b.marketCap || 0) - (a.marketCap || 0);
  });

  return (
    <Card 
      className={`bg-[#0f0f0f] border-[#2a2a2a] shadow-lg ${className || ''}`}
      data-testid="umf-snapshot"
      role="region"
      aria-label="Market snapshot section showing key asset prices"
    >
      <CardHeader>
        <CardTitle className="text-lg text-foreground">
          Market Snapshot
        </CardTitle>
      </CardHeader>

      <CardContent>
        <div 
          className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-3"
          role="list"
          aria-label="Key asset prices and changes"
        >
          {sortedAssets.map((asset) => (
            <AssetTile key={asset.id} asset={asset} />
          ))}
        </div>

        {sortedAssets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No snapshot data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Individual Asset Tile Component
 * Displays symbol, price, 24h change, and sparkline placeholder
 * Enhanced with keyboard navigation and detailed tooltip
 */
function AssetTile({ asset }: { asset: UmfAsset }) {
  const [tooltipOpen, setTooltipOpen] = useState(false);
  const isPositive = asset.changePct24h >= 0;
  const isFlat = Math.abs(asset.changePct24h) < 0.01;
  
  // Get appropriate icons
  const TrendIcon = isFlat ? Minus : isPositive ? TrendingUp : TrendingDown;
  const ArrowIcon = isPositive ? ArrowUp : ArrowDown;
  
  // Get asset class display name
  const assetClassLabel = {
    crypto: 'Cryptocurrency',
    index: 'Stock Index',
    forex: 'Forex',
    commodity: 'Commodity',
    etf: 'ETF',
  }[asset.class];

  // Format last update time (UTC + Local)
  const lastUpdateUTC = new Date(asset.updatedAt_utc).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });

  const lastUpdateLocal = new Date(asset.updatedAt_utc).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  // Handle keyboard activation (Enter or Space)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setTooltipOpen(prev => !prev);
    }
  };

  // Show tooltip on focus
  const handleFocus = () => {
    setTooltipOpen(true);
  };

  // Hide tooltip on blur
  const handleBlur = () => {
    setTooltipOpen(false);
  };

  return (
    <Tooltip open={tooltipOpen} onOpenChange={setTooltipOpen}>
      <TooltipTrigger asChild>
        <div
          className="p-3 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover-elevate active-elevate-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C7AE6A]/50"
          role="listitem"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={`${asset.name}, ${assetClassLabel}, price ${asset.price} dollars, ${isPositive ? 'up' : 'down'} ${Math.abs(asset.changePct24h)} percent in 24 hours. Press Enter to view details.`}
          data-testid={`snapshot-tile-${asset.symbol}`}
        >
          {/* Header: Logo + Symbol + Asset Class Badge */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {asset.image && (
                <img 
                  src={asset.image} 
                  alt={`${asset.name} logo`}
                  className="w-4 h-4 rounded-full object-contain"
                  onError={(e) => {
                    // Hide image if it fails to load
                    e.currentTarget.style.display = 'none';
                  }}
                />
              )}
              <span className="text-sm font-bold text-foreground">
                {asset.symbol}
              </span>
            </div>
            <Badge 
              variant="outline" 
              className="text-xs bg-[#2a2a2a]/50 border-[#2a2a2a]"
              data-testid={`snapshot-badge-${asset.symbol}`}
            >
              {asset.class.toUpperCase()}
            </Badge>
          </div>

          {/* Price */}
          <div className="mb-2">
            <div 
              className="text-lg font-mono font-semibold text-foreground"
              data-testid={`snapshot-price-${asset.symbol}`}
            >
              ${asset.price.toLocaleString(undefined, {
                minimumFractionDigits: asset.price < 1 ? 4 : 2,
                maximumFractionDigits: asset.price < 1 ? 4 : 2,
              })}
            </div>
            <div className="text-xs text-muted-foreground truncate">
              {asset.name}
            </div>
          </div>

          {/* 24h Change - Icon-enhanced badge for accessibility */}
          <div className="flex items-center justify-between">
            <div 
              className={`flex items-center gap-1 text-sm font-medium ${
                isFlat 
                  ? 'text-muted-foreground' 
                  : isPositive 
                  ? 'text-green-500' 
                  : 'text-red-500'
              }`}
              data-testid={`snapshot-change-${asset.symbol}`}
            >
              <TrendIcon className="w-3 h-3" aria-label={isPositive ? 'Trending up' : isFlat ? 'No change' : 'Trending down'} />
              <ArrowIcon className="w-3 h-3" aria-label={isPositive ? 'Up arrow' : 'Down arrow'} />
              <span>
                {isPositive && !isFlat ? '+' : ''}
                {asset.changePct24h.toFixed(2)}%
              </span>
            </div>

            {/* Sparkline Placeholder */}
            <div 
              className="w-12 h-6 flex items-center justify-center opacity-40"
              aria-hidden="true"
              title="Sparkline chart (placeholder)"
            >
              <BarChart3 className="w-4 h-4 text-muted-foreground" aria-label="Chart icon" />
            </div>
          </div>
        </div>
      </TooltipTrigger>
      
      <TooltipContent 
        side="top" 
        className="bg-[#1a1a1a] border-[#2a2a2a] max-w-xs"
        role="tooltip"
      >
        <div className="space-y-2">
          <div>
            <div className="font-semibold text-foreground">{asset.name}</div>
            <div className="text-xs text-muted-foreground">{assetClassLabel}</div>
          </div>
          
          {asset.marketCap && (
            <div className="text-xs text-muted-foreground">
              Market Cap: ${(asset.marketCap / 1e9).toFixed(1)}B
            </div>
          )}
          {asset.volume24h && (
            <div className="text-xs text-muted-foreground">
              24h Volume: ${(asset.volume24h / 1e9).toFixed(1)}B
            </div>
          )}
          
          <div className="pt-2 border-t border-[#2a2a2a] space-y-1">
            <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" aria-label="Clock icon" />
              <div className="space-y-0.5">
                <div className="font-medium">Last Updated:</div>
                <div><span className="font-medium">UTC:</span> {lastUpdateUTC}</div>
                <div><span className="font-medium">Local:</span> {lastUpdateLocal}</div>
              </div>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
