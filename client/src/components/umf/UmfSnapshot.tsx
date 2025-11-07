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
 * @see client/src/hooks/useUmf.ts - useUmfSnapshot() hook
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TrendingUp, TrendingDown, Minus, BarChart3, Clock } from "lucide-react";
import type { UmfAsset } from "@shared/schema";

interface UmfSnapshotProps {
  assets: UmfAsset[];
  className?: string;
}

/**
 * Priority assets to display in snapshot grid
 * Filters snapshot to show only these key assets
 */
const PRIORITY_SYMBOLS = ['BTC', 'ETH', 'SOL', 'SPX', 'NDX', 'DXY', 'GOLD', 'WTI'];

export function UmfSnapshot({ assets, className }: UmfSnapshotProps) {
  // Filter to priority assets only
  const priorityAssets = assets.filter(asset => 
    PRIORITY_SYMBOLS.includes(asset.symbol)
  );

  // Sort by priority order
  const sortedAssets = priorityAssets.sort((a, b) => 
    PRIORITY_SYMBOLS.indexOf(a.symbol) - PRIORITY_SYMBOLS.indexOf(b.symbol)
  );

  return (
    <Card 
      className={`bg-[#111] border-[#2a2a2a] shadow-lg ${className || ''}`}
      data-testid="umf-snapshot"
      role="region"
      aria-label="Market snapshot for key assets"
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
          aria-label="Key asset prices"
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
  
  // Get appropriate icon
  const TrendIcon = isFlat ? Minus : isPositive ? TrendingUp : TrendingDown;
  
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
          className="p-3 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] hover-elevate active-elevate-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C7AE6A]/50"
          role="listitem"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          onBlur={handleBlur}
          aria-label={`${asset.name}, price ${asset.price}, ${isPositive ? 'up' : 'down'} ${Math.abs(asset.changePct24h)}% in 24 hours. Press Enter to view details.`}
          data-testid={`snapshot-tile-${asset.symbol}`}
        >
          {/* Header: Symbol + Asset Class Badge */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-foreground">
              {asset.symbol}
            </span>
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

          {/* 24h Change */}
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
              <TrendIcon className="w-3 h-3" aria-hidden="true" />
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
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        </div>
      </TooltipTrigger>
      
      <TooltipContent 
        side="top" 
        className="bg-[#0a0a0a] border-[#2a2a2a] max-w-xs"
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
              <Clock className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <div className="space-y-0.5">
                <div className="font-medium">Last Updated:</div>
                <div>UTC: {lastUpdateUTC}</div>
                <div>Local: {lastUpdateLocal}</div>
              </div>
            </div>
          </div>
        </div>
      </TooltipContent>
    </Tooltip>
  );
}
