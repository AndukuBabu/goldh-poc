import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, ArrowLeft, AlertCircle, Database } from "lucide-react";
import { useLocation } from "wouter";
import { useEconEvents } from "@/hooks/useEcon";
import { 
  EconSummary, 
  EconFilters, 
  EconLegend, 
  EconList,
  EconErrorState
} from "@/components/econ";
import type { EconEventFilters } from "@/lib/econ";

const isDev = import.meta.env.DEV;

export default function FeaturesCalendar() {
  const [, setLocation] = useLocation();
  
  // Performance: Mark component mount start
  useEffect(() => {
    if (isDev) {
      performance.mark('econ-calendar-mount-start');
    }
  }, []);
  
  // Filter state with defaults: next 14 days, all regions/categories, all importance
  const [filters, setFilters] = useState<EconEventFilters>({
    // from and to will default to today → +14 days in useEconEvents hook
  });

  // Fetch events with current filters
  const { data: events = [], isLoading, error, dataUpdatedAt } = useEconEvents(filters);

  // Performance: Track when data is loaded and component is ready
  useEffect(() => {
    if (isDev && !isLoading && events.length > 0) {
      // Mark first paint (when data is available and ready to render)
      performance.mark('econ-calendar-first-paint');
      
      // Measure time from mount to first paint
      try {
        const measure = performance.measure(
          'econ-calendar-render-time',
          'econ-calendar-mount-start',
          'econ-calendar-first-paint'
        );
        
        console.log(
          `%c[EconCalendar] First Paint`,
          'color: #C7AE6A; font-weight: bold;',
          `${measure.duration.toFixed(2)}ms (${events.length} events)`
        );
        
        // Check if we're under target
        if (measure.duration > 500) {
          console.warn(
            `%c[EconCalendar] Performance Warning`,
            'color: #ff6b6b; font-weight: bold;',
            `First paint took ${measure.duration.toFixed(2)}ms (target: <500ms)`
          );
        } else {
          console.log(
            `%c[EconCalendar] Performance`,
            'color: #51cf66; font-weight: bold;',
            `✓ Under 500ms target`
          );
        }
      } catch (err) {
        // Marks may not exist if component remounted
        console.debug('[EconCalendar] Performance marks not available');
      }
    }
  }, [isLoading, events.length]);

  // Count active filters (excluding default date range)
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.country && filters.country.length > 0) count++;
    if (filters.category && filters.category.length > 0) count++;
    if (filters.importance && filters.importance.length > 0) count++;
    if (filters.status) count++;
    return count;
  }, [filters]);

  // Format last updated timestamp
  const lastUpdated = useMemo(() => {
    if (!dataUpdatedAt) return 'Never';
    return new Date(dataUpdatedAt).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, [dataUpdatedAt]);

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
                  Economic Calendar
                </h1>
                <p className="text-muted-foreground text-lg mt-2">
                  Never miss a market-moving event.
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-4xl">
              Track global macroeconomic events that impact crypto markets. From Fed rate decisions to employment reports, 
              stay informed with upcoming releases, forecasts, and live data updates. Filter by region, category, and importance 
              to focus on what matters most to your portfolio.
            </p>
          </div>

          {/* Coming Soon Note */}
          <div className="mb-6 p-3 border border-primary/20 rounded-lg bg-card/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-foreground/80">
                <span className="font-semibold text-primary">Coming Soon:</span> Real-time API integration, ML impact predictions, and live notifications. 
                Currently showing mock data for preview.
              </p>
            </div>
          </div>

          {/* Main Economic Calendar Section */}
          <section 
            data-testid="econ-section"
            className="space-y-6"
          >
            {/* Summary KPIs */}
            <EconSummary events={events} isLoading={isLoading} />

            {/* Filters */}
            <EconFilters 
              filters={filters} 
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />

            {/* Two-column layout: Legend (sidebar) + Events (main) */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Legend - Left sidebar (1 column on large screens) */}
              <div className="lg:col-span-1">
                <EconLegend />
              </div>

              {/* Event List - Main content (3 columns on large screens) */}
              <div className="lg:col-span-3">
                {error ? (
                  <EconErrorState 
                    error={error} 
                    onRetry={() => window.location.reload()} 
                  />
                ) : (
                  <EconList 
                    events={events} 
                    isLoading={isLoading}
                    pageSize={20}
                  />
                )}
              </div>
            </div>

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
                        Live data from Trading Economics, Alpha Vantage, and Benzinga
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">ML Impact Predictions</p>
                      <p className="text-muted-foreground">
                        AI models predict market volatility and asset price reactions
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">Live Notifications</p>
                      <p className="text-muted-foreground">
                        Browser and mobile alerts for high-impact events before release
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">Calendar Grid View</p>
                      <p className="text-muted-foreground">
                        Interactive monthly calendar with event previews and drill-downs
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">Personalized Filters</p>
                      <p className="text-muted-foreground">
                        Save filter preferences and get custom event feeds by asset class
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-primary mt-1.5" />
                    <div>
                      <p className="font-semibold text-foreground">UMF Integration</p>
                      <p className="text-muted-foreground">
                        See event impact on asset prices with real-time correlation charts
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
