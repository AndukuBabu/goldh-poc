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
import { TrendingUp, ArrowLeft, Database, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import {
  useUmfSnapshot,
  useUmfMovers,
  useUmfBrief,
  useUmfAlerts,
} from "@/hooks/useUmf";
import {
  UmfMorningBrief,
  UmfSnapshot,
  UmfTopMovers,
  UmfAlertList,
} from "@/components/umf";

export default function FeaturesUMF() {
  const [, setLocation] = useLocation();
  
  // Fetch UMF data with loading states
  const { data: snapshot, isLoading: snapshotLoading, error: snapshotError } = useUmfSnapshot();
  const { data: movers = [], isLoading: moversLoading, error: moversError } = useUmfMovers();
  const { data: brief, isLoading: briefLoading, error: briefError } = useUmfBrief();
  const { data: alerts = [], isLoading: alertsLoading, error: alertsError } = useUmfAlerts();
  
  // Combined loading state
  const isLoading = snapshotLoading || moversLoading || briefLoading || alertsLoading;
  
  // Check if any critical data failed to load
  const hasError = snapshotError || moversError || briefError || alertsError;

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

          {/* Error State */}
          {hasError && !isLoading && (
            <Card className="bg-red-500/10 border-red-500/30 mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
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
              {/* Morning Brief Skeleton */}
              <div className="h-40 bg-[#111] border border-[#C7AE6A]/20 rounded-lg animate-pulse" />
              
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
              {/* Section 1: Morning Intelligence Brief (Full Width) */}
              {brief ? (
                <UmfMorningBrief brief={brief} />
              ) : (
                <Card className="bg-[#111] border-[#C7AE6A]/20 shadow-lg">
                  <CardContent className="p-12">
                    <div className="text-center text-muted-foreground">
                      <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-40" />
                      <p className="text-sm">No morning intelligence available</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Sections 2 & 3: Two-Column Layout (Market Snapshot + Top Movers) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Section 2: Market Snapshot */}
                {snapshot && snapshot.assets.length > 0 ? (
                  <UmfSnapshot assets={snapshot.assets} />
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
