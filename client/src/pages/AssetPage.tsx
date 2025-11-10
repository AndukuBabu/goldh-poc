import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Header } from "@/components/Header";
import { SignInPrompt } from "@/components/SignInPrompt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, TrendingDown, ExternalLink, ArrowLeft, AlertCircle } from "lucide-react";
import type { AssetOverview } from "@shared/schema";

export default function AssetPage() {
  const params = useParams<{ symbol: string }>();
  const [, setLocation] = useLocation();
  const symbol = params.symbol?.toUpperCase() || "";
  
  const { data: asset, isLoading, error } = useQuery<AssetOverview>({
    queryKey: [`/api/asset/${symbol}`],
    enabled: !!symbol,
  });
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-asset" />
        </div>
      </div>
    );
  }
  
  if (error || !asset) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            className="mb-6"
            data-testid="button-back-error"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-destructive">
                <AlertCircle className="w-5 h-5" />
                <p data-testid="text-error">
                  {error ? "Failed to load asset data" : "Asset not found"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  const { name, class: assetClass, priceSummary, news, events, degraded } = asset;
  const isPositive = priceSummary ? priceSummary.changePct24h >= 0 : false;
  const changeColor = isPositive ? "text-green-500" : "text-red-500";
  const TrendIcon = isPositive ? TrendingUp : TrendingDown;
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SignInPrompt />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard")}
          className="mb-6"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
        
        {/* Asset Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-foreground mb-2" data-testid="text-asset-name">
                {symbol}
              </h1>
              <p className="text-xl text-muted-foreground" data-testid="text-asset-fullname">
                {name}
              </p>
            </div>
            
            <Badge variant="secondary" data-testid="badge-asset-class">
              {assetClass}
            </Badge>
          </div>
          
          {/* Price Summary */}
          {degraded.price || !priceSummary ? (
            <Card className="bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-muted-foreground" data-testid="text-price-unavailable">
                  Price data currently unavailable
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Price</p>
                    <p className="text-3xl font-bold text-foreground" data-testid="text-current-price">
                      ${priceSummary.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">24h Change</p>
                    <p className={`text-2xl font-semibold ${changeColor} flex items-center gap-2`} data-testid="text-24h-change">
                      <TrendIcon className="w-5 h-5" />
                      {priceSummary.changePct24h.toFixed(2)}%
                    </p>
                  </div>
                  
                  {priceSummary.volume24h !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">24h Volume</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="text-volume">
                        ${(priceSummary.volume24h / 1_000_000_000).toFixed(2)}B
                      </p>
                    </div>
                  )}
                  
                  {priceSummary.marketCap !== null && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Market Cap</p>
                      <p className="text-lg font-semibold text-foreground" data-testid="text-marketcap">
                        ${(priceSummary.marketCap / 1_000_000_000).toFixed(2)}B
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        {/* Tabs: News & Events */}
        <Tabs defaultValue="news" className="w-full">
          <TabsList className="grid w-full grid-cols-2" data-testid="tabs-asset-data">
            <TabsTrigger value="news" data-testid="tab-news">
              News ({news.length})
            </TabsTrigger>
            <TabsTrigger value="events" data-testid="tab-events">
              Events ({events.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="news" className="mt-6" data-testid="tab-content-news">
            {degraded.news && news.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    News data currently unavailable
                  </p>
                </CardContent>
              </Card>
            ) : news.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground" data-testid="text-no-news">
                    No recent news for {symbol}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {news.map((article, idx) => (
                  <Card key={`${article.link}-${idx}`} data-testid={`card-news-${idx}`}>
                    <CardHeader>
                      <CardTitle className="text-lg">
                        <a
                          href={article.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary transition-colors flex items-center gap-2"
                          data-testid={`link-news-${idx}`}
                        >
                          {article.title}
                          <ExternalLink className="w-4 h-4 shrink-0" />
                        </a>
                      </CardTitle>
                      <CardDescription data-testid={`text-news-date-${idx}`}>
                        {new Date(article.date).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground" data-testid={`text-news-summary-${idx}`}>
                        {article.summary}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="events" className="mt-6" data-testid="tab-content-events">
            {degraded.events ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground">
                    Economic calendar integration coming soon
                  </p>
                </CardContent>
              </Card>
            ) : events.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground" data-testid="text-no-events">
                    No upcoming events for {symbol}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {events.map((event) => (
                  <Card key={event.id} data-testid={`card-event-${event.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="text-lg" data-testid={`text-event-title-${event.id}`}>
                          {event.title}
                        </CardTitle>
                        <Badge
                          variant={
                            event.importance === "High"
                              ? "destructive"
                              : event.importance === "Medium"
                              ? "default"
                              : "secondary"
                          }
                          data-testid={`badge-event-importance-${event.id}`}
                        >
                          {event.importance}
                        </Badge>
                      </div>
                      <CardDescription data-testid={`text-event-date-${event.id}`}>
                        {new Date(event.datetime_utc).toLocaleString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
