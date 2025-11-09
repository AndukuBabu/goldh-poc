import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { TrendingUp, TrendingDown, Newspaper } from "lucide-react";
import type { AssetOverview } from "@shared/schema";

interface AssetCardProps {
  asset: AssetOverview;
}

export function AssetCard({ asset }: AssetCardProps) {
  const { symbol, name, priceSummary, news, degraded } = asset;
  
  const isPositive = priceSummary ? priceSummary.changePct24h >= 0 : false;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  const hasNews = news.length > 0;
  const isPriceDegraded = degraded.price || !priceSummary;
  
  return (
    <Link href={`/asset/${symbol}`}>
      <Card 
        className="hover-elevate active-elevate-2 cursor-pointer transition-all duration-200 h-full"
        data-testid={`card-asset-${symbol}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3 
                className="text-lg font-semibold text-foreground truncate"
                data-testid={`text-symbol-${symbol}`}
              >
                {symbol}
              </h3>
              <p 
                className="text-sm text-muted-foreground truncate"
                data-testid={`text-name-${symbol}`}
              >
                {name}
              </p>
            </div>
            
            {hasNews && (
              <Badge 
                variant="secondary" 
                className="flex items-center gap-1 shrink-0"
                data-testid={`badge-news-${symbol}`}
              >
                <Newspaper className="w-3 h-3" />
                {news.length}
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent>
          {isPriceDegraded ? (
            <div 
              className="text-sm text-muted-foreground"
              data-testid={`text-price-unavailable-${symbol}`}
            >
              Price unavailable
            </div>
          ) : (
            <div className="space-y-1">
              <div 
                className="text-2xl font-bold text-foreground"
                data-testid={`text-price-${symbol}`}
              >
                ${priceSummary!.price.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </div>
              
              <div 
                className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}
                data-testid={`text-change-${symbol}`}
              >
                <TrendIcon className="w-4 h-4" />
                {priceSummary!.changePct24h.toFixed(2)}%
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
