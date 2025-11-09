import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { TrendingUp, DollarSign, Calendar, ArrowRight, Lock } from "lucide-react";

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

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  impact: 'high' | 'medium' | 'low';
}

export function PreviewWidgets() {
  const { user } = useAuth();

  const { data: newsArticles = [] } = useQuery<NewsArticle[]>({
    queryKey: ['/api/guru-digest'],
  });

  const { data: marketSnapshot } = useQuery<{ assets: MarketAsset[] }>({
    queryKey: ['/api/umf/snapshot'],
  });

  const marketData = marketSnapshot?.assets || [];

  const guruPreview = newsArticles.slice(0, 3);
  const marketPreview = marketData.slice(0, 4);

  const mockEvents: CalendarEvent[] = [
    { id: '1', title: 'Federal Reserve Interest Rate Decision', date: '2025-01-29', impact: 'high' },
    { id: '2', title: 'Bitcoin Halving Event', date: '2024-04-20', impact: 'high' },
    { id: '3', title: 'Ethereum Network Upgrade', date: '2025-03-15', impact: 'medium' },
  ];

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
          {/* Guru & Insider Digest Widget */}
          <Card className="p-4 sm:p-6 relative overflow-hidden" data-testid="widget-guru-digest">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Guru Digest</h3>
                <p className="text-xs text-muted-foreground">Latest crypto news</p>
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
              
              {!user && (
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent flex items-end justify-center pb-6 backdrop-blur-[2px]">
                  <div className="text-center space-y-3">
                    <Lock className="w-6 h-6 text-primary mx-auto" />
                    <Link href="/signin">
                      <Button size="sm" className="gap-2" data-testid="button-signin-guru">
                        Sign In to View All
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <Link href="/features/guru">
                <Button variant="outline" size="sm" className="w-full mt-4 gap-2" data-testid="link-guru-digest">
                  View All News
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </Card>

          {/* Universal Market Financials Widget */}
          <Card className="p-4 sm:p-6 relative overflow-hidden" data-testid="widget-umf">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Market Financials</h3>
                <p className="text-xs text-muted-foreground">Live market data</p>
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
              
              {!user && (
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent flex items-end justify-center pb-6 backdrop-blur-[2px]">
                  <div className="text-center space-y-3">
                    <Lock className="w-6 h-6 text-primary mx-auto" />
                    <Link href="/signin">
                      <Button size="sm" className="gap-2" data-testid="button-signin-umf">
                        Sign In to View All
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <Link href="/features/umf">
                <Button variant="outline" size="sm" className="w-full mt-4 gap-2" data-testid="link-umf">
                  View Full Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </Card>

          {/* Economic Calendar Widget */}
          <Card className="p-4 sm:p-6 relative overflow-hidden" data-testid="widget-calendar">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Economic Calendar</h3>
                <p className="text-xs text-muted-foreground">Upcoming events</p>
              </div>
            </div>

            <div className="space-y-3">
              {mockEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className={`pb-3 border-b border-border last:border-0 ${index >= 1 && !user ? 'blur-sm' : ''}`}
                >
                  <div className="flex items-start gap-2 mb-1">
                    <Badge 
                      variant={event.impact === 'high' ? 'destructive' : event.impact === 'medium' ? 'default' : 'secondary'}
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
              ))}
              
              {!user && (
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent flex items-end justify-center pb-6 backdrop-blur-[2px]">
                  <div className="text-center space-y-3">
                    <Lock className="w-6 h-6 text-primary mx-auto" />
                    <Link href="/signin">
                      <Button size="sm" className="gap-2" data-testid="button-signin-calendar">
                        Sign In to View All
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {user && (
              <Link href="/features/calendar">
                <Button variant="outline" size="sm" className="w-full mt-4 gap-2" data-testid="link-calendar">
                  View Full Calendar
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            )}
          </Card>
        </div>
      </div>
    </section>
  );
}
