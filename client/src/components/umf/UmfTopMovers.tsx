/**
 * UMF Top Movers Component
 * 
 * Displays two side-by-side lists:
 * - Top Gainers (largest positive 24h % changes)
 * - Top Losers (largest negative 24h % changes)
 * 
 * Each entry shows: symbol, name, 24h % badge, price
 * 
 * @see client/src/hooks/useUmf.ts - useUmfMovers() hook
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { UmfMover } from "@shared/schema";

interface UmfTopMoversProps {
  movers: UmfMover[];
  className?: string;
}

export function UmfTopMovers({ movers, className }: UmfTopMoversProps) {
  // Split into gainers and losers
  const gainers = movers.filter(m => m.direction === 'gainer');
  const losers = movers.filter(m => m.direction === 'loser');

  return (
    <Card 
      className={`bg-[#111] border-[#2a2a2a] shadow-lg ${className || ''}`}
      data-testid="umf-top-movers"
      role="region"
      aria-label="Top market movers - gainers and losers"
    >
      <CardHeader>
        <CardTitle className="text-lg text-foreground">
          Top Movers
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Gainers Section */}
        <section 
          aria-labelledby="gainers-heading"
          data-testid="movers-gainers-section"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
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
          aria-labelledby="losers-heading"
          data-testid="movers-losers-section"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
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
  );
}

/**
 * Individual Mover Item Component
 * Displays symbol, name, price, and 24h change badge
 */
interface MoverItemProps {
  mover: UmfMover;
  type: 'gainer' | 'loser';
}

function MoverItem({ mover, type }: MoverItemProps) {
  const isGainer = type === 'gainer';
  const changeColor = isGainer ? 'text-green-500' : 'text-red-500';
  const badgeBg = isGainer ? 'bg-green-500/10' : 'bg-red-500/10';
  const badgeBorder = isGainer ? 'border-green-500/30' : 'border-red-500/30';

  return (
    <div
      className="flex items-center justify-between p-3 rounded-md bg-[#0a0a0a] border border-[#2a2a2a] hover-elevate transition-all"
      role="listitem"
      aria-label={`${mover.name}, ${isGainer ? 'up' : 'down'} ${Math.abs(mover.changePct24h)}% at ${mover.price}`}
      data-testid={`mover-${type}-${mover.symbol}`}
    >
      {/* Left: Symbol + Name */}
      <div className="flex flex-col min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span 
            className="text-sm font-bold text-foreground"
            data-testid={`mover-symbol-${mover.symbol}`}
          >
            {mover.symbol}
          </span>
          {isGainer ? (
            <TrendingUp className="w-3 h-3 text-green-500" aria-hidden="true" />
          ) : (
            <TrendingDown className="w-3 h-3 text-red-500" aria-hidden="true" />
          )}
        </div>
        <span className="text-xs text-muted-foreground truncate">
          {mover.name}
        </span>
      </div>

      {/* Right: Price + Change Badge */}
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
          className={`text-xs font-bold ${badgeBg} ${badgeBorder} ${changeColor}`}
          data-testid={`mover-change-${mover.symbol}`}
        >
          {isGainer ? '+' : ''}
          {mover.changePct24h.toFixed(2)}%
        </Badge>
      </div>
    </div>
  );
}
