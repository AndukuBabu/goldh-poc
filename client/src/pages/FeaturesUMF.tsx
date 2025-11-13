/**
 * UMF (Universal Market Financials) Feature Page
 * 
 * Full-screen feature page displaying:
 * - Market snapshot (Top-20 crypto + indices + forex + commodities)
 * - Top movers (gainers/losers)
 * - Market alerts (optional)
 * 
 * MVP: Uses Firestore mock data
 * Future: Will consume /api/umf/* endpoints
 * 
 * @see docs/UMF-UI-MVP.md for full specification
 */

import { Header } from "@/components/Header";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowLeft, Database, AlertCircle, Clock, ExternalLink } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useLocation } from "wouter";
import {
  useUmfSnapshot,
  useUmfMovers,
  useUmfAlerts,
} from "@/hooks/useUmf";
import {
  UmfSnapshot,
  UmfTopMovers,
  UmfAlertList,
} from "@/components/umf";
import {
  mapSnapshotExtendedToAssets,
  mapMoversExtendedToMovers,
  getSnapshotMetadata,
  getMoversMetadata,
} from "@/lib/umf_adapters";

export default function FeaturesUMF() {
  const [, setLocation] = useLocation();
  
  // Fetch UMF data with loading states
  const { data: snapshotExtended, isLoading: snapshotLoading, error: snapshotError } = useUmfSnapshot();
  const { data: moversExtended, isLoading: moversLoading, error: moversError } = useUmfMovers();
  const { data: alerts = [], isLoading: alertsLoading, error: alertsError } = useUmfAlerts();
  
  // Transform extended data to UI-friendly format using adapters
  const assets = mapSnapshotExtendedToAssets(snapshotExtended);
  const movers = mapMoversExtendedToMovers(moversExtended);
  
  // Extract metadata for debugging/transparency
  const snapshotMeta = getSnapshotMetadata(snapshotExtended);
  const moversMeta = getMoversMetadata(moversExtended);
  
  // Combined loading state
  const isLoading = snapshotLoading || moversLoading || alertsLoading;
  
  // Check if any critical data failed to load
  const hasError = snapshotError || moversError || alertsError;

  return (
    <div className="min-h-screen bg-background" data-testid="umf-page">
      <Header />
      <SignInPrompt />
      
      <main className="pt-24 pb-16 px-6" role="main" aria-label="GOLDH Pulse page">
        <div className="container mx-auto max-w-7xl">
          {/* Back Button */}
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/features")}
            className="mb-6"
            data-testid="button-back-features"
            aria-label="Navigate back to features page"
          >
            <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
            <span>Back to Features</span>
          </Button>

          {/* Page Hero */}
          <header className="mb-8 space-y-4" role="banner">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Icon */}
              <div 
                className="w-16 h-16 rounded-lg bg-gradient-to-br from-[#C7AE6A]/20 to-[#C7AE6A]/5 border-2 border-[#C7AE6A]/30 flex items-center justify-center"
                aria-hidden="true"
              >
                <TrendingUp className="w-8 h-8 text-[#C7AE6A]" aria-label="Trending up icon" />
              </div>
              
              {/* Title & Badges */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-4xl font-bold text-foreground">
                    GOLDH Pulse
                  </h1>
                  
                  {/* Data Source Badge */}
                  {snapshotMeta && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        snapshotMeta.sourceUi === 'Live' 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                          : snapshotMeta.sourceUi === 'Firestore'
                          ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                          : 'bg-[#C7AE6A]/10 border-[#C7AE6A]/30 text-[#C7AE6A]'
                      }`}
                      data-testid="badge-data-source"
                      aria-label={`Data source: ${snapshotMeta.sourceUi}`}
                    >
                      <Database className="w-3 h-3 mr-1" aria-hidden="true" />
                      <span>Data: {snapshotMeta.sourceUi}</span>
                    </Badge>
                  )}
                  
                  {/* Degraded Status Indicator */}
                  {snapshotMeta?.degraded && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-amber-500/10 border-amber-500/30 text-amber-400"
                          data-testid="badge-degraded"
                          aria-label="Serving degraded data"
                        >
                          <span 
                            className="w-2 h-2 rounded-full bg-amber-500 mr-1.5 animate-pulse" 
                            aria-hidden="true"
                          />
                          <span>Degraded</span>
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent 
                        className="bg-[#1a1a1a] border-[#C7AE6A]/30 text-foreground"
                        data-testid="tooltip-degraded"
                      >
                        <p>Serving last good snapshot</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  
                  {/* Last Updated */}
                  {snapshotMeta && snapshotMeta.ageMinutes !== undefined && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-muted/50 border-muted-foreground/20 text-muted-foreground"
                      data-testid="badge-last-updated"
                      aria-label={`Last updated ${snapshotMeta.ageMinutes.toFixed(1)} minutes ago`}
                    >
                      <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                      <span>
                        Updated {snapshotMeta.ageMinutes < 1 
                          ? 'just now' 
                          : `${Math.floor(snapshotMeta.ageMinutes)} min ago`}
                      </span>
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-lg mt-2">
                  See the full market picture at a glance. See everything, understand instantly, and act confidently.
                </p>
              </div>
            </div>
            
            {/* Subcopy */}
            <p className="text-base text-muted-foreground leading-relaxed max-w-4xl">
              Track top-20 cryptocurrencies, major indices (S&P 500, NASDAQ), forex (DXY), 
              and commodities (Gold, Oil) in one unified dashboard with real-time market alerts.
            </p>
          </header>

          {/* Error State */}
          {hasError && !isLoading && (
            <Card 
              className="bg-red-500/10 border-red-500/30 mb-6"
              role="alert"
              aria-live="assertive"
              aria-label="Error loading market data"
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" aria-label="Error icon" />
                  <div>
                    <h3 className="text-sm font-semibold text-red-500 mb-1">
                      Failed to Load Market Data
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Some market data could not be loaded. Please refresh the page to try again.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loading State - Skeleton Screens */}
          {isLoading && (
            <div className="space-y-6" data-testid="umf-loading">
              {/* Two-Column Grid Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="h-96 bg-[#111] border border-[#2a2a2a] rounded-lg animate-pulse" />
                <div className="h-96 bg-[#111] border border-[#2a2a2a] rounded-lg animate-pulse" />
              </div>
            </div>
          )}

          {/* Main Content - Show when data is loaded */}
          {!isLoading && (
            <div className="space-y-6" data-testid="umf-content">
              {/* Two-Column Layout (Market Snapshot + Top Movers) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 2: Market Snapshot */}
                {assets && assets.length > 0 ? (
                  <UmfSnapshot assets={assets} />
                ) : (
                  <Card className="bg-[#111] border-[#2a2a2a] shadow-lg">
                    <CardContent className="p-12">
                      <div className="text-center text-muted-foreground">
                        <Database className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium mb-1">No Market Data</p>
                        <p className="text-xs">Snapshot data is currently unavailable</p>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Section 3: Top Movers */}
                {movers.length > 0 ? (
                  <UmfTopMovers movers={movers} />
                ) : (
                  <Card className="bg-[#111] border-[#2a2a2a] shadow-lg">
                    <CardContent className="p-12">
                      <div className="text-center text-muted-foreground">
                        <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-40" />
                        <p className="text-sm font-medium mb-1">No Movers Data</p>
                        <p className="text-xs">Top movers data is currently unavailable</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Section 4: Market Alerts (Conditional) */}
              {alerts.length > 0 && (
                <section data-testid="section-alerts">
                  <UmfAlertList alerts={alerts} />
                </section>
              )}
              
              {/* CoinGecko Attribution */}
              <footer 
                className="mt-12 pt-6 border-t border-[#2a2a2a]"
                role="contentinfo"
                aria-label="Data attribution"
              >
                <div className="flex items-center justify-center gap-2">
                  <a 
                    href="https://www.coingecko.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex"
                    data-testid="link-coingecko-badge"
                    aria-label="Powered by CoinGecko - opens in new window"
                  >
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-muted/30 border-muted-foreground/20 text-muted-foreground hover:bg-muted/40 transition-colors cursor-pointer inline-flex items-center gap-1.5"
                      data-testid="badge-coingecko-attribution"
                    >
                      <Database className="w-3 h-3" aria-hidden="true" />
                      <span>Powered by CoinGecko</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </Badge>
                  </a>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Real-time cryptocurrency market data provided by{' '}
                  <a 
                    href="https://www.coingecko.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#C7AE6A] hover:text-[#d5c28f] underline underline-offset-2 transition-colors"
                    data-testid="link-coingecko"
                    aria-label="Visit CoinGecko website - opens in new window"
                  >
                    CoinGecko API
                  </a>
                </p>
              </footer>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
