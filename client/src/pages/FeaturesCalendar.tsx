import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, TrendingUp, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";

export default function FeaturesCalendar() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
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

          {/* Page Header */}
          <div className="mb-8 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-primary/30 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground">
                  Economic Calendar with AI Impact
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Never miss a market-moving event.
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
              Global crypto-relevant macroeconomic events delivered in real time — with intelligent summaries, 
              live countdowns, and impact signals powered by AI. From Fed decisions to inflation releases, 
              never get blindsided again.
            </p>
          </div>

          {/* Coming Soon Banner */}
          <Card className="mb-8 border-2 border-amber-800/50 bg-gradient-to-r from-amber-950/20 to-amber-900/10">
            <CardHeader className="pb-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-900/50 border border-amber-800/60 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl text-amber-200">
                      Beta Preview - Mock Data
                    </CardTitle>
                    <Badge variant="outline" className="bg-amber-900/30 text-amber-300 border-amber-700">
                      MVP Phase
                    </Badge>
                  </div>
                  <CardDescription className="text-base text-amber-100/70">
                    You're viewing a functional preview with mock economic events. 
                    Real-time API integration, AI impact predictions, and live notifications coming in Phase 2.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-3 text-sm text-amber-200/80">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>58 Mock Events</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>Filtering & Search</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>Real-time APIs (Coming Soon)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                  <span>ML Impact Models (Coming Soon)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Main Economic Calendar Section */}
          <section 
            data-testid="econ-section"
            className="space-y-6"
          >
            {/* Feature Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-primary/20 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">58</p>
                      <p className="text-sm text-muted-foreground">Total Events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-900/20 border border-green-800/30 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">43</p>
                      <p className="text-sm text-muted-foreground">Upcoming</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-900/20 border border-red-800/30 flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">26</p>
                      <p className="text-sm text-muted-foreground">High Impact</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-primary/20 bg-card/50">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-900/20 border border-blue-800/30 flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-400">6</span>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">31</p>
                      <p className="text-sm text-muted-foreground">US Events</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Filter Bar - Component Scaffold */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Filter Events</CardTitle>
                <CardDescription>
                  Narrow down events by region, category, importance, or date range
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-24 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    📊 EconFilterBar component will be inserted here
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Event List - Component Scaffold */}
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="text-lg">Economic Events</CardTitle>
                <CardDescription>
                  Showing events from the next 14 days with AI impact predictions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Placeholder for EconEventList component */}
                  <div className="h-96 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                    <div className="text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mb-2">
                        📅 EconEventList component will be inserted here
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        Displaying ~58 mock events with filters, badges, and hover effects
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Future Features Teaser */}
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span className="text-2xl">🚀</span>
                  Coming in Phase 2
                </CardTitle>
                <CardDescription>
                  Advanced features currently under development
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">Real-time API Integration</p>
                      <p className="text-muted-foreground">
                        Live data from Trading Economics, Alpha Vantage, and more
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">ML Impact Predictions</p>
                      <p className="text-muted-foreground">
                        AI models predict market volatility and asset reactions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">Live Notifications</p>
                      <p className="text-muted-foreground">
                        Browser and mobile alerts for high-impact events
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">Calendar Grid View</p>
                      <p className="text-muted-foreground">
                        Interactive monthly calendar with event previews
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">Personalized Filters</p>
                      <p className="text-muted-foreground">
                        Save filter preferences and get custom event feeds
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">UMF Integration</p>
                      <p className="text-muted-foreground">
                        See event impact on asset prices in real-time
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
