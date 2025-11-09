/**
 * UMF Top Movers Component
 * 
 * Displays two side-by-side lists:
 * - Top Gainers (largest positive 24h % changes)
 * - Top Losers (largest negative 24h % changes)
 * 
 * Each entry shows: symbol, name, 24h % badge, price
 * Enhanced with clickable rows that open detail drawer
 * 
 * Theming: Black-gold premium aesthetic (#0f0f0f, #1a1a1a, #2a2a2a, #C7AE6A)
 * Accessibility: Icon-enhanced badges, keyboard navigation, ARIA labels
 * 
 * @see client/src/hooks/useUmf.ts - useUmfMovers() hook
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TrendingUp, TrendingDown, Clock, BarChart3, X, ArrowUp, ArrowDown, Circle } from "lucide-react";
import type { UmfMover } from "@shared/schema";

interface UmfTopMoversProps {
  movers: UmfMover[];
  className?: string;
}

export function UmfTopMovers({ movers, className }: UmfTopMoversProps) {
  const [selectedMover, setSelectedMover] = useState<UmfMover | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Split into gainers and losers
  const gainers = movers.filter(m => m.direction === 'gainer');
  const losers = movers.filter(m => m.direction === 'loser');

  const handleMoverClick = (mover: UmfMover) => {
    setSelectedMover(mover);
    setDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    // Delay clearing selected mover to allow sheet animation to complete
    setTimeout(() => setSelectedMover(null), 300);
  };

  return (
    <>
      <Card 
        className={`bg-[#0f0f0f] border-[#2a2a2a] shadow-lg ${className || ''}`}
        data-testid="umf-top-movers"
        role="region"
        aria-label="Top market movers section showing gainers and losers"
      >
        <CardHeader>
          <CardTitle className="text-lg text-foreground">
            Top Movers
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Gainers Section */}
          <section 
            role="region"
            aria-labelledby="gainers-heading"
            data-testid="movers-gainers-section"
          >
            <div className="flex items-center gap-2 mb-3">
              <Circle className="w-2 h-2 fill-green-500 text-green-500" aria-label="Green circle indicator" />
              <h3 
                id="gainers-heading" 
                className="text-sm font-semibold text-green-500"
              >
                Top Gainers
              </h3>
            </div>

            <div className="space-y-2" role="list" aria-label="Top gaining assets">
              {gainers.length > 0 ? (
                gainers.map((mover) => (
                  <MoverItem 
                    key={`gainer-${mover.symbol}`} 
                    mover={mover} 
                    type="gainer"
                    onClick={() => handleMoverClick(mover)}
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No gainers data available
                </div>
              )}
            </div>
          </section>

          <Separator className="bg-[#2a2a2a]" />

          {/* Losers Section */}
          <section 
            role="region"
            aria-labelledby="losers-heading"
            data-testid="movers-losers-section"
          >
            <div className="flex items-center gap-2 mb-3">
              <Circle className="w-2 h-2 fill-red-500 text-red-500" aria-label="Red circle indicator" />
              <h3 
                id="losers-heading" 
                className="text-sm font-semibold text-red-500"
              >
                Top Losers
              </h3>
            </div>

            <div className="space-y-2" role="list" aria-label="Top losing assets">
              {losers.length > 0 ? (
                losers.map((mover) => (
                  <MoverItem 
                    key={`loser-${mover.symbol}`} 
                    mover={mover} 
                    type="loser"
                    onClick={() => handleMoverClick(mover)}
                  />
                ))
              ) : (
                <div className="text-sm text-muted-foreground text-center py-4">
                  No losers data available
                </div>
              )}
            </div>
          </section>
        </CardContent>
      </Card>

      {/* Mover Detail Drawer */}
      {selectedMover && (
        <MoverDetailSheet
          mover={selectedMover}
          open={drawerOpen}
          onOpenChange={handleCloseDrawer}
        />
      )}
    </>
  );
}

/**
 * Individual Mover Item Component
 * Displays symbol, name, price, and 24h change badge
 * Enhanced with click handler and keyboard support
 */
interface MoverItemProps {
  mover: UmfMover;
  type: 'gainer' | 'loser';
  onClick: () => void;
}

function MoverItem({ mover, type, onClick }: MoverItemProps) {
  const isGainer = type === 'gainer';
  const changeColor = isGainer ? 'text-green-500' : 'text-red-500';
  const badgeBg = isGainer ? 'bg-green-500/10' : 'bg-red-500/10';
  const badgeBorder = isGainer ? 'border-green-500/30' : 'border-red-500/30';

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className="flex items-center justify-between p-3 rounded-md bg-[#1a1a1a] border border-[#2a2a2a] hover-elevate active-elevate-2 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#C7AE6A]/50"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`${mover.name}, ${isGainer ? 'up' : 'down'} ${Math.abs(mover.changePct24h)} percent at ${mover.price} dollars. Press Enter to view details.`}
      data-testid={`mover-${type}-${mover.symbol}`}
    >
      {/* Left: Logo + Symbol + Name */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        {mover.image && (
          <img 
            src={mover.image} 
            alt={`${mover.name} logo`}
            className="w-5 h-5 rounded-full object-contain flex-shrink-0"
            onError={(e) => {
              // Hide image if it fails to load
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span 
              className="text-sm font-bold text-foreground"
              data-testid={`mover-symbol-${mover.symbol}`}
            >
              {mover.symbol}
            </span>
            {isGainer ? (
              <TrendingUp className="w-3 h-3 text-green-500" aria-label="Trending up icon" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" aria-label="Trending down icon" />
            )}
          </div>
          <span className="text-xs text-muted-foreground truncate">
            {mover.name}
          </span>
        </div>
      </div>

      {/* Right: Price + Change Badge with icons */}
      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <span 
          className="text-sm font-mono text-foreground"
          data-testid={`mover-price-${mover.symbol}`}
        >
          ${mover.price.toLocaleString(undefined, {
            minimumFractionDigits: mover.price < 1 ? 4 : 2,
            maximumFractionDigits: mover.price < 1 ? 4 : 2,
          })}
        </span>
        <Badge 
          variant="outline"
          className={`text-xs font-bold ${badgeBg} ${badgeBorder} ${changeColor} flex items-center gap-1`}
          data-testid={`mover-change-${mover.symbol}`}
        >
          {isGainer ? (
            <ArrowUp className="w-3 h-3" aria-label="Up arrow icon" />
          ) : (
            <ArrowDown className="w-3 h-3" aria-label="Down arrow icon" />
          )}
          <span>
            {isGainer ? '+' : ''}
            {mover.changePct24h.toFixed(2)}%
          </span>
        </Badge>
      </div>
    </div>
  );
}

/**
 * Mover Detail Sheet Component
 * Displays detailed information about a selected mover
 */
interface MoverDetailSheetProps {
  mover: UmfMover;
  open: boolean;
  onOpenChange: () => void;
}

function MoverDetailSheet({ mover, open, onOpenChange }: MoverDetailSheetProps) {
  const isGainer = mover.direction === 'gainer';
  const changeColor = isGainer ? 'text-green-500' : 'text-red-500';
  const TrendIcon = isGainer ? TrendingUp : TrendingDown;

  // Get asset class display name
  const assetClassLabel = {
    crypto: 'Cryptocurrency',
    index: 'Stock Index',
    forex: 'Forex',
    commodity: 'Commodity',
    etf: 'ETF',
  }[mover.class];

  // Format last update time
  const lastUpdateUTC = new Date(mover.updatedAt_utc).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'UTC',
    timeZoneName: 'short',
  });

  const lastUpdateLocal = new Date(mover.updatedAt_utc).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  });

  // Mock description based on asset type
  const getMockDescription = () => {
    if (mover.class === 'crypto') {
      return `${mover.name} is experiencing ${isGainer ? 'strong buying pressure' : 'significant selling pressure'} today. The ${Math.abs(mover.changePct24h).toFixed(2)}% ${isGainer ? 'surge' : 'decline'} reflects ${isGainer ? 'bullish' : 'bearish'} sentiment across major exchanges with increased trading volume and market participation.`;
    } else if (mover.class === 'index') {
      return `The ${mover.name} is ${isGainer ? 'rallying' : 'declining'} by ${Math.abs(mover.changePct24h).toFixed(2)}% as ${isGainer ? 'investors show confidence' : 'concerns weigh on market sentiment'}. This movement reflects broader market trends and ${isGainer ? 'positive' : 'negative'} economic indicators.`;
    } else if (mover.class === 'commodity') {
      return `${mover.name} prices are ${isGainer ? 'climbing' : 'falling'} ${Math.abs(mover.changePct24h).toFixed(2)}% amid ${isGainer ? 'strong demand and supply constraints' : 'weakening demand and oversupply concerns'}. Market participants are closely monitoring global economic conditions.`;
    } else {
      return `${mover.name} shows ${isGainer ? 'strength' : 'weakness'} with a ${Math.abs(mover.changePct24h).toFixed(2)}% ${isGainer ? 'gain' : 'loss'} today, driven by market dynamics and trading activity.`;
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        className="bg-[#0f0f0f] border-[#2a2a2a] w-full sm:max-w-lg"
        role="dialog"
        aria-label={`${mover.name} details`}
        data-testid={`mover-detail-sheet-${mover.symbol}`}
      >
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                <span>{mover.symbol}</span>
                <TrendIcon className={`w-6 h-6 ${changeColor}`} aria-label={isGainer ? 'Trending up' : 'Trending down'} />
              </SheetTitle>
              <SheetDescription className="text-base text-muted-foreground mt-1">
                {mover.name}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Price & Change Card */}
          <Card className="bg-[#1a1a1a] border-[#2a2a2a]">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Current Price</div>
                  <div className="text-3xl font-mono font-bold text-foreground">
                    ${mover.price.toLocaleString(undefined, {
                      minimumFractionDigits: mover.price < 1 ? 4 : 2,
                      maximumFractionDigits: mover.price < 1 ? 4 : 2,
                    })}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className={`text-base font-bold ${isGainer ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'} ${changeColor} flex items-center gap-1.5`}
                  >
                    {isGainer ? (
                      <ArrowUp className="w-4 h-4" aria-label="Up arrow" />
                    ) : (
                      <ArrowDown className="w-4 h-4" aria-label="Down arrow" />
                    )}
                    <span>
                      {isGainer ? '+' : ''}
                      {mover.changePct24h.toFixed(2)}%
                    </span>
                  </Badge>
                  <span className="text-sm text-muted-foreground">24h Change</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Asset Details */}
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Asset Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset Class</span>
                  <Badge variant="outline" className="bg-[#2a2a2a]/50 border-[#2a2a2a]">
                    {assetClassLabel}
                  </Badge>
                </div>
                {mover.marketCap && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Market Cap</span>
                    <span className="font-mono text-foreground">
                      ${(mover.marketCap / 1e9).toFixed(2)}B
                    </span>
                  </div>
                )}
                {mover.volume24h && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">24h Volume</span>
                    <span className="font-mono text-foreground">
                      ${(mover.volume24h / 1e9).toFixed(2)}B
                    </span>
                  </div>
                )}
              </div>
            </div>

            <Separator className="bg-[#2a2a2a]" />

            {/* Market Context */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Market Context</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getMockDescription()}
              </p>
            </div>

            <Separator className="bg-[#2a2a2a]" />

            {/* Last Update */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4" aria-label="Clock icon" />
                <span>Last Updated</span>
              </h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>
                  <span className="font-medium">UTC:</span> {lastUpdateUTC}
                </div>
                <div>
                  <span className="font-medium">Local:</span> {lastUpdateLocal}
                </div>
              </div>
            </div>

            {/* Sparkline Placeholder */}
            <div className="pt-4">
              <div className="h-32 rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" aria-label="Chart icon" />
                  <p className="text-xs">Price chart coming soon</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
