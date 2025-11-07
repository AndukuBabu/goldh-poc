/**
 * UMF (Universal Market Financials) Feature Page
 * 
 * Full-screen feature page displaying:
 * - Market snapshot (Top-20 crypto + indices + forex + commodities)
 * - Top movers (gainers/losers)
 * - Morning Intelligence brief
 * - Market alerts (optional)
 * 
 * MVP: Uses Firestore mock data
 * Future: Will consume /api/umf/* endpoints
 * 
 * @see docs/UMF-UI-MVP.md for full specification
 */

import { Header } from "@/components/Header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowLeft, Database } from "lucide-react";
import { useLocation } from "wouter";
import {
  useUmfSnapshot,
  useUmfMovers,
  useUmfBrief,
  useUmfAlerts,
} from "@/hooks/useUmf";

export default function FeaturesUMF() {
  const [, setLocation] = useLocation();
  
  // Fetch UMF data
  const { data: snapshot, isLoading: snapshotLoading } = useUmfSnapshot();
  const { data: movers = [], isLoading: moversLoading } = useUmfMovers();
  const { data: brief, isLoading: briefLoading } = useUmfBrief();
  const { data: alerts = [], isLoading: alertsLoading } = useUmfAlerts();
  
  const isLoading = snapshotLoading || moversLoading || briefLoading || alertsLoading;

  return (
    <div className="min-h-screen bg-background" data-testid="umf-page">
      <Header />
      
      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/features")}
            className="mb-6"
            data-testid="button-back-features"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Features
          </Button>

          {/* Page Hero */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Icon */}
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#C7AE6A]/20 to-[#C7AE6A]/5 border-2 border-[#C7AE6A]/30 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-[#C7AE6A]" />
              </div>
              
              {/* Title & Badge */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-bold text-foreground">
                    Universal Market Financials
                  </h1>
                  <Badge 
                    variant="outline" 
                    className="text-xs bg-[#C7AE6A]/10 border-[#C7AE6A]/30 text-[#C7AE6A]"
                    data-testid="badge-mock-data"
                  >
                    <Database className="w-3 h-3 mr-1" />
                    UI Mock Data
                  </Badge>
                </div>
                <p className="text-muted-foreground text-lg mt-2">
                  Your daily control center for crypto, equities, and market intelligence
                </p>
              </div>
            </div>
            
            {/* Subcopy */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-4xl">
              Track top-20 cryptocurrencies, major indices (S&P 500, NASDAQ), forex (DXY), 
              and commodities (Gold, Oil) in one unified dashboard. Get instant insights with 
              AI-generated market briefs and real-time alerts.
            </p>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <div className="h-32 bg-[#111] border border-[#2a2a2a] rounded-lg animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-[#111] border border-[#2a2a2a] rounded-lg animate-pulse" />
                <div className="h-96 bg-[#111] border border-[#2a2a2a] rounded-lg animate-pulse" />
              </div>
            </div>
          )}

          {/* Main Layout */}
          {!isLoading && (
            <div className="space-y-6" data-testid="umf-content">
              {/* Section 1: Morning Intelligence Banner (Full Width) */}
              <section data-testid="section-morning-intelligence">
                <Card className="bg-[#111] border-[#C7AE6A]/20 shadow-lg">
                  <CardContent className="p-6">
                    {brief ? (
                      <div className="space-y-4">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-[#C7AE6A]/20 flex items-center justify-center flex-shrink-0">
                            <TrendingUp className="w-5 h-5 text-[#C7AE6A]" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h2 className="text-xl font-semibold text-[#C7AE6A] mb-2">
                              Morning Intelligence
                            </h2>
                            <p className="text-base text-foreground font-medium mb-3">
                              {brief.headline}
                            </p>
                            <ul className="space-y-2 text-sm text-muted-foreground">
                              {brief.bullets.map((bullet, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                  <span className="text-[#C7AE6A] mt-1">•</span>
                                  <span>{bullet}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No morning intelligence available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </section>

              {/* Sections 2 & 3: Two-Column Layout (Market Snapshot + Top Movers) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 2: Market Snapshot */}
                <section data-testid="section-market-snapshot">
                  <Card className="bg-[#111] border-[#2a2a2a] shadow-lg h-full">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Market Snapshot
                      </h3>
                      {snapshot && snapshot.assets.length > 0 ? (
                        <div className="space-y-3">
                          {/* Preview: Show first 10 assets */}
                          {snapshot.assets.slice(0, 10).map((asset) => (
                            <div 
                              key={asset.id} 
                              className="flex items-center justify-between p-3 rounded-md bg-[#0a0a0a] border border-[#2a2a2a] hover-elevate transition-all"
                              data-testid={`asset-${asset.symbol}`}
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="flex flex-col">
                                  <span className="text-sm font-semibold text-foreground">
                                    {asset.symbol}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate">
                                    {asset.name}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <div className="text-sm font-mono text-foreground">
                                    ${asset.price.toLocaleString()}
                                  </div>
                                  <div className={`text-xs font-medium ${
                                    asset.changePct24h >= 0 
                                      ? 'text-green-500' 
                                      : 'text-red-500'
                                  }`}>
                                    {asset.changePct24h >= 0 ? '+' : ''}
                                    {asset.changePct24h.toFixed(2)}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                          
                          {/* Show count of remaining assets */}
                          {snapshot.assets.length > 10 && (
                            <div className="text-center pt-2 text-sm text-muted-foreground">
                              + {snapshot.assets.length - 10} more assets
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No market data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>

                {/* Section 3: Top Movers */}
                <section data-testid="section-top-movers">
                  <Card className="bg-[#111] border-[#2a2a2a] shadow-lg h-full">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Top Movers
                      </h3>
                      {movers.length > 0 ? (
                        <div className="space-y-6">
                          {/* Gainers */}
                          <div>
                            <h4 className="text-sm font-medium text-green-500 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Top Gainers
                            </h4>
                            <div className="space-y-2">
                              {movers
                                .filter(m => m.direction === 'gainer')
                                .slice(0, 5)
                                .map((mover) => (
                                  <div 
                                    key={`gainer-${mover.symbol}`}
                                    className="flex items-center justify-between p-2 rounded bg-[#0a0a0a] border border-[#2a2a2a]"
                                    data-testid={`mover-gainer-${mover.symbol}`}
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-foreground">
                                        {mover.symbol}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {mover.name}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-mono text-foreground">
                                        ${mover.price.toLocaleString()}
                                      </div>
                                      <div className="text-xs font-bold text-green-500">
                                        +{mover.changePct24h.toFixed(2)}%
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>

                          {/* Losers */}
                          <div>
                            <h4 className="text-sm font-medium text-red-500 mb-3 flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-red-500" />
                              Top Losers
                            </h4>
                            <div className="space-y-2">
                              {movers
                                .filter(m => m.direction === 'loser')
                                .slice(0, 5)
                                .map((mover) => (
                                  <div 
                                    key={`loser-${mover.symbol}`}
                                    className="flex items-center justify-between p-2 rounded bg-[#0a0a0a] border border-[#2a2a2a]"
                                    data-testid={`mover-loser-${mover.symbol}`}
                                  >
                                    <div className="flex flex-col">
                                      <span className="text-sm font-semibold text-foreground">
                                        {mover.symbol}
                                      </span>
                                      <span className="text-xs text-muted-foreground">
                                        {mover.name}
                                      </span>
                                    </div>
                                    <div className="text-right">
                                      <div className="text-sm font-mono text-foreground">
                                        ${mover.price.toLocaleString()}
                                      </div>
                                      <div className="text-xs font-bold text-red-500">
                                        {mover.changePct24h.toFixed(2)}%
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          No movers data available
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </section>
              </div>

              {/* Section 4: Alerts (Optional) */}
              {alerts.length > 0 && (
                <section data-testid="section-alerts">
                  <Card className="bg-[#111] border-[#2a2a2a] shadow-lg">
                    <CardContent className="p-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">
                        Market Alerts
                      </h3>
                      <div className="space-y-3">
                        {alerts.map((alert) => (
                          <div
                            key={alert.id}
                            className={`p-4 rounded-lg border ${
                              alert.severity === 'high'
                                ? 'bg-red-500/10 border-red-500/30'
                                : alert.severity === 'warn'
                                ? 'bg-yellow-500/10 border-yellow-500/30'
                                : 'bg-blue-500/10 border-blue-500/30'
                            }`}
                            data-testid={`alert-${alert.id}`}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                  alert.severity === 'high'
                                    ? 'bg-red-500/20'
                                    : alert.severity === 'warn'
                                    ? 'bg-yellow-500/20'
                                    : 'bg-blue-500/20'
                                }`}
                              >
                                <span className="text-sm font-bold">
                                  {alert.severity === 'high' ? '!' : alert.severity === 'warn' ? '⚠' : 'i'}
                                </span>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-semibold text-foreground mb-1">
                                  {alert.title}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {alert.body}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </section>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
