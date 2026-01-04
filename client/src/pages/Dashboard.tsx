import { useQueries } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssetCard } from "@/components/AssetCard";
import { useToast } from "@/hooks/use-toast";
import { useUmfSnapshot } from "@/hooks/useUmf";
import { Sparkles, TrendingUp, Loader2, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useMemo } from "react";
import type { AssetOverview } from "@shared/schema";
import { CANONICAL_SYMBOLS, ASSET_CLASSES, ASSET_DISPLAY_NAMES } from "@shared/constants";

// Tracked crypto assets for the dashboard (filter out non-crypto assets)
const TRACKED_ASSETS = CANONICAL_SYMBOLS.filter(symbol => ASSET_CLASSES[symbol] === 'crypto');

const INITIAL_DISPLAY_COUNT = 12;

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showAll, setShowAll] = useState(false);

  const isPremium = user?.isPremium || false;

  // Fetch UMF snapshot directly (same 1-hour cache as GOLDH Pulse)
  const { data: umfData, isLoading: isLoadingUmf, error: umfError } = useUmfSnapshot();

  // Determine which assets to display
  const displayedAssets = showAll ? TRACKED_ASSETS : TRACKED_ASSETS.slice(0, INITIAL_DISPLAY_COUNT);

  // Find assets missing from UMF snapshot
  const missingAssets = useMemo(() => {
    if (!umfData?.data) return [];
    return displayedAssets.filter(symbol =>
      !umfData.data.assets.find(a => a.symbol === symbol)
    );
  }, [displayedAssets, umfData]);

  // Fallback: fetch individual asset data for assets not in UMF snapshot
  const fallbackQueries = useQueries({
    queries: missingAssets.map(symbol => ({
      queryKey: [`/api/asset/${symbol}`],
      enabled: !!umfData?.data,
    })),
  });

  // Map UMF snapshot data + fallback data to AssetOverview format
  const assetDisplayData = displayedAssets.map(symbol => {
    if (isLoadingUmf || !umfData?.data) {
      return {
        symbol,
        data: undefined,
        isLoading: true,
        isError: false,
      };
    }

    // Try to find asset in UMF snapshot first
    const asset = umfData.data.assets.find(a => a.symbol === symbol);

    if (asset) {
      // Found in UMF snapshot - use it
      const assetOverview: AssetOverview = {
        symbol,
        name: ASSET_DISPLAY_NAMES[symbol] || symbol,
        class: ASSET_CLASSES[symbol] || 'crypto',
        image: null,
        priceSummary: {
          price: asset.price,
          changePct24h: asset.changePct24h ?? 0,
          volume24h: asset.volume24h ?? null,
          marketCap: asset.marketCap ?? null,
          updatedAt_utc: umfData.data.timestamp_utc,
        },
        news: [],
        events: [],
        degraded: {
          price: umfData.degraded,
          news: false,
          events: true,
        },
      };

      return {
        symbol,
        data: assetOverview,
        isLoading: false,
        isError: false,
      };
    }

    // Not in UMF snapshot - check fallback query
    const fallbackIndex = missingAssets.indexOf(symbol);
    if (fallbackIndex >= 0) {
      const fallbackQuery = fallbackQueries[fallbackIndex];
      return {
        symbol,
        data: fallbackQuery.data as AssetOverview | undefined,
        isLoading: fallbackQuery.isLoading,
        isError: fallbackQuery.isError,
      };
    }

    // Should never reach here, but return error state as fallback
    return {
      symbol,
      data: undefined,
      isLoading: false,
      isError: true,
    };
  });


  if (authLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SignInPrompt />

      <div className="pt-24 pb-16 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Welcome Section */}
          <div className="mb-8 space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
              {isPremium && (
                <Badge className="bg-primary text-primary-foreground" data-testid="badge-premium">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground text-lg">
              Welcome to your GOLDH intelligence center
            </p>
          </div>

          {/* Real-Time Feeds Coming Soon Banner */}
          <Card className="mb-8 border-2 border-[#C7AE6A]/30 bg-gradient-to-r from-[#C7AE6A]/10 to-[#C7AE6A]/5">
            <CardContent className="py-6">
              <div className="flex items-center justify-center gap-3 text-center">
                <Sparkles className="w-5 h-5 text-[#C7AE6A]" />
                <p className="text-lg font-semibold text-foreground">
                  Real-time feeds coming soon
                </p>
                <Sparkles className="w-5 h-5 text-[#C7AE6A]" />
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">
                Live WebSocket data streams and instant price updates are on the way
              </p>
            </CardContent>
          </Card>

          {/* Asset Grid */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4" data-testid="text-assets-heading">
              Market Overview
            </h2>

            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6"
              data-testid="grid-assets"
            >
              {assetDisplayData.map(({ symbol, data, isLoading: loading, isError }) => {
                if (loading) {
                  return (
                    <Card key={symbol} className="h-full" data-testid={`card-asset-loading-${symbol}`}>
                      <CardContent className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      </CardContent>
                    </Card>
                  );
                }

                if (isError || !data) {
                  return (
                    <Card key={symbol} className="h-full border-destructive/50" data-testid={`card-asset-error-${symbol}`}>
                      <CardHeader>
                        <CardTitle className="text-lg text-foreground">{symbol}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Failed to load data
                        </p>
                      </CardContent>
                    </Card>
                  );
                }

                if (!data || !data.priceSummary) {
                  return null;
                }

                return <AssetCard key={symbol} asset={data} />;
              })}
            </div>

            {TRACKED_ASSETS.length > INITIAL_DISPLAY_COUNT && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setShowAll(!showAll)}
                  data-testid="button-show-more"
                >
                  {showAll ? (
                    <>
                      <ChevronUp className="w-4 h-4 mr-2" />
                      Show Less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4 mr-2" />
                      Show More ({TRACKED_ASSETS.length - INITIAL_DISPLAY_COUNT} more)
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Premium Access Teaser */}
          <Card className="mb-8 border-2 border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Rocket className="w-6 h-6 text-primary" />
                    Premium Access Coming Soon
                  </CardTitle>
                  <CardDescription className="text-base">
                    Unlock exclusive features with subscription access
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Advanced Analytics
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Real-time market analysis powered by AI to help you make informed decisions
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Early Access Benefits
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Be among the first to access new features and premium tools
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Portfolio Tracking
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Track all your crypto assets in one place with real-time valuations
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Premium Insights
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Exclusive market reports and trading signals for premium members
                  </p>
                </div>
              </div>

              {!isPremium && (
                <div className="mt-6 p-4 rounded-md bg-background/50 border border-border">
                  <p className="text-sm text-muted-foreground">
                    <Rocket className="w-4 h-4 inline mr-2 text-primary" />
                    Unlock Premium access when subscriptions launch! Get exclusive features, advanced analytics, and premium insights. Stay tuned for launch details.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
