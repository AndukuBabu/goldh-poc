import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewsScroller } from "@/components/NewsScroller";
import { Sparkles, TrendingUp, Clock, ExternalLink, Loader2 } from "lucide-react";

const newsArticles = [
  {
    id: "1",
    title: "Bitcoin ETF approvals signal new era for institutional crypto",
    source: "CryptoDaily",
    time: "2h ago",
    url: "#"
  },
  {
    id: "2",
    title: "Ethereum gas fees drop to lowest levels in months",
    source: "DeFi Pulse",
    time: "5h ago",
    url: "#"
  },
  {
    id: "3",
    title: "Major exchange announces support for new altcoins",
    source: "Blockchain News",
    time: "8h ago",
    url: "#"
  },
  {
    id: "4",
    title: "Stablecoin adoption grows 200% in emerging markets",
    source: "Crypto Insights",
    time: "12h ago",
    url: "#"
  }
];

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { data: newsData, isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news"],
  });

  const isPremium = user?.isPremium || false;
  const mockNews = newsData || [
    { id: "1", title: "DeFi protocols see massive growth in user adoption", url: "#" },
    { id: "2", title: "Layer 2 solutions reduce gas fees by 90%", url: "#" },
    { id: "3", title: "Institutional investors increase crypto holdings", url: "#" },
  ];

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
    setLocation("/signin");
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

          {/* GOLDH Features Coming Soon */}
          <Card className="mb-8 border-2 border-primary bg-primary/5">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    GOLDH Features Coming Soon
                  </CardTitle>
                  <CardDescription className="text-base">
                    Exciting new features are on the way!
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
                    <Sparkles className="w-4 h-4 inline mr-2 text-primary" />
                    Connect your wallet with 5000+ GOLDH tokens to unlock Premium status and get early access to these features!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* News Scroller */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">Trending Now</h2>
            <NewsScroller articles={mockNews} />
          </div>

          {/* Crypto News Feed */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Crypto News Feed</h2>
            <div className="grid gap-4">
              {newsArticles.map((article) => (
                <Card key={article.id} className="hover-elevate active-elevate-2 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <a
                      href={article.url}
                      className="block space-y-2"
                      data-testid={`link-news-article-${article.id}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-foreground leading-tight flex-1">
                          {article.title}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-1" />
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{article.source}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.time}
                        </span>
                      </div>
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
