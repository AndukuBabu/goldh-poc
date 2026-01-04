import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { TrendingUp, DollarSign, Calendar, ArrowRight } from "lucide-react";
import { useEconEvents } from "@/hooks/useEcon";
import { ECON_IMPACT_COLORS } from "@/lib/econ";

interface NewsArticle {
  id: string;
  title: string;
  publishedAt: string;
  source: string;
}

interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  changePct24h: number;
}

// Note: CalendarEvent type removed - now using EconEvent from schema directly

export function PreviewWidgets() {
  const { data: newsArticles = [] } = useQuery<NewsArticle[]>({
    queryKey: ['/api/news/guru-digest'],
  });

  const { data: marketSnapshot } = useQuery<{ assets: MarketAsset[] }>({
    queryKey: ['/api/umf/snapshot'],
  });

  const marketData = marketSnapshot?.assets || [];

  const guruPreview = newsArticles.slice(0, 3);
  const marketPreview = marketData.slice(0, 4);

  // Fetch High impact economic events from Firestore
  // Use start of today (00:00:00) to capture all events for today and beyond
  // Memoize date values to prevent infinite re-renders (changing query key)
  const dateRange = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return { from: startOfToday, to: thirtyDaysFromNow };
  }, []);

  const { data: econEvents = [] } = useEconEvents({
    impact: ['High'],
    from: dateRange.from,
    to: dateRange.to,
  });

  // Sort by date (ascending) to get upcoming events first, then take top 3
  const sortedEvents = [...econEvents].sort((a, b) =>
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const calendarPreview = sortedEvents.slice(0, 3);

  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 bg-background">
      <div className="container mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Live Crypto Intelligence
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground">
            Real-time data from our premium features
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
          {/* Guru Talk Widget */}
          <Card className="p-4 sm:p-6 relative overflow-hidden" data-testid="widget-guru-digest">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Guru Talk</h3>
                <p className="text-xs text-muted-foreground">Expert insights</p>
              </div>
            </div>

            <div className="space-y-3">
              {guruPreview.map((article, index) => (
                <div key={article.id} className="pb-3 border-b border-border last:border-0">
                  <p className="text-sm font-medium text-foreground line-clamp-2">
                    {article.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{article.source}</p>
                </div>
              ))}
            </div>

            <Link href="/features/guru">
              <Button variant="outline" size="sm" className="w-full mt-4 gap-2" data-testid="link-guru-digest">
                View All News
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>

          {/* GOLDH Pulse Widget */}
          <Card className="p-4 sm:p-6 relative overflow-hidden" data-testid="widget-umf">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">GOLDH Pulse</h3>
                <p className="text-xs text-muted-foreground">Market snapshot</p>
              </div>
            </div>

            <div className="space-y-3">
              {marketPreview.map((asset) => (
                <div key={asset.id} className="flex items-center justify-between pb-3 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">
                      ${asset.price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}
                    </p>
                    <Badge
                      variant={asset.changePct24h >= 0 ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {asset.changePct24h >= 0 ? '+' : ''}{asset.changePct24h?.toFixed(2)}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/features/umf">
              <Button variant="outline" size="sm" className="w-full mt-4 gap-2" data-testid="link-umf">
                View Full Dashboard
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>

          {/* Market Events Widget */}
          <Card className="p-4 sm:p-6 relative overflow-hidden" data-testid="widget-calendar">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Market Events</h3>
                <p className="text-xs text-muted-foreground">Upcoming events</p>
              </div>
            </div>

            <div className="space-y-3">
              {calendarPreview.length > 0 ? (
                calendarPreview.map((event) => (
                  <div
                    key={event.id}
                    className="pb-3 border-b border-border last:border-0"
                  >
                    <div className="flex items-start gap-2 mb-1">
                      <Badge
                        variant={(ECON_IMPACT_COLORS[event.impact as keyof typeof ECON_IMPACT_COLORS] || "secondary") as any}
                        className="text-xs"
                      >
                        {event.impact.toUpperCase()}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming high-impact events</p>
              )}
            </div>

            <Link href="/features/calendar">
              <Button variant="outline" size="sm" className="w-full mt-4 gap-2" data-testid="link-calendar">
                View Full Calendar
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
}
