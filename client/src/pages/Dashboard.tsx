import { useQueries } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AssetCard } from "@/components/AssetCard";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, TrendingUp, Loader2, Wallet, Rocket, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import type { AssetOverview } from "@shared/schema";
import { CANONICAL_SYMBOLS, ASSET_CLASSES } from "@shared/constants";

// Tracked crypto assets for the dashboard (filter out non-crypto assets)
const TRACKED_ASSETS = CANONICAL_SYMBOLS.filter(symbol => ASSET_CLASSES[symbol] === 'crypto');

const INITIAL_DISPLAY_COUNT = 12;

export default function Dashboard() {
  const { user, isLoading: authLoading, connectWallet } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const isPremium = user?.isPremium || false;
  const hasWallet = !!user?.walletAddress;
  
  // Fetch asset data for tracked assets
  const displayedAssets = showAll ? TRACKED_ASSETS : TRACKED_ASSETS.slice(0, INITIAL_DISPLAY_COUNT);
  
  const assetQueries = useQueries({
    queries: displayedAssets.map(symbol => ({
      queryKey: [`/api/asset/${symbol}`],
      enabled: !!user,
    })),
  });
  
  const isLoadingAssets = assetQueries.some(q => q.isLoading);
  
  // Create asset display data, including error states
  const assetDisplayData = displayedAssets.map((symbol, index) => {
    const query = assetQueries[index];
    return {
      symbol,
      data: query.data as AssetOverview | undefined,
      isLoading: query.isLoading,
      isError: query.isError,
    };
  });

  const handleWalletConnect = async () => {
    setIsConnecting(true);
    try {
      const ethereum = (window as any).ethereum;
      if (typeof ethereum !== 'undefined') {
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        const walletAddress = accounts[0];
        
        const mockBalance = Math.floor(Math.random() * 10000);
        
        await connectWallet(walletAddress, mockBalance);
        
        toast({
          title: "Wallet Connected!",
          description: mockBalance >= 5000 
            ? `Premium status activated! Balance: ${mockBalance} GOLDH` 
            : `Connected: ${walletAddress.substring(0, 6)}...${walletAddress.substring(walletAddress.length - 4)}`,
        });
      } else {
        toast({
          title: "MetaMask Not Found",
          description: "Please install MetaMask to connect your wallet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };
  // Redirect to signin if not authenticated (using useEffect to avoid render-time state updates)
  useEffect(() => {
    // Check both user state and localStorage sessionId to handle timing issues
    const storedSessionId = localStorage.getItem("sessionId");
    if (!authLoading && !user && !storedSessionId) {
      setLocation("/signin");
    }
  }, [authLoading, user, setLocation]);

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

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
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

          {/* Wallet Connection Card - Only shown if not connected */}
          {!hasWallet && (
            <Card className="mb-8 border-2 border-primary/40 bg-gradient-to-br from-primary/5 to-primary/10" data-testid="card-wallet-connect">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <CardTitle className="text-2xl flex items-center gap-2">
                      <Wallet className="w-6 h-6 text-primary" />
                      Connect Your Wallet
                    </CardTitle>
                    <CardDescription className="text-base">
                      Unlock Premium features by connecting your MetaMask wallet
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Connect your wallet to access Premium features. Hold 5000+ GOLDH tokens to automatically unlock Premium status and get exclusive benefits!
                </p>
                <Button
                  size="lg"
                  onClick={handleWalletConnect}
                  disabled={isConnecting}
                  className="w-full md:w-auto"
                  data-testid="button-connect-wallet"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnecting ? "Connecting..." : "Connect MetaMask"}
                </Button>
              </CardContent>
            </Card>
          )}

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
                    Multiple ways to unlock premium features
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
                    Token Rewards
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Earn GOLDH tokens for active participation and early adoption
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
                    Unlock Premium via tokens or subscription! Hold 5000+ GOLDH tokens in your wallet OR subscribe when subscriptions launch. Flexible access for everyone.
                  </p>
                </div>
              )}
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
        </div>
      </div>
    </div>
  );
}
