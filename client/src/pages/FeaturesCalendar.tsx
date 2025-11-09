import { useState, useMemo, useEffect } from "react";
import { Header } from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, ArrowLeft, AlertCircle, Database, List, Grid3x3 } from "lucide-react";
import { useLocation, useSearch } from "wouter";
import { useEconEvents } from "@/hooks/useEcon";
import { 
  EconSummary, 
  EconFilters, 
  EconLegend, 
  EconList,
  EconErrorState
} from "@/components/econ";
import { EconCalendarGrid } from "@/components/econ/EconCalendarGrid";
import type { EconEventFilters } from "@/lib/econ";

const isDev = import.meta.env.DEV;

export default function FeaturesCalendar() {
  const [, setLocation] = useLocation();
  const searchParams = useSearch();
  
  // Parse view from URL query parameter (default to 'list')
  const currentView = useMemo(() => {
    const params = new URLSearchParams(searchParams);
    const view = params.get('view');
    return view === 'grid' ? 'grid' : 'list';
  }, [searchParams]);
  
  // Handle view toggle
  const handleViewChange = (newView: string) => {
    if (!newView) return; // Prevent deselecting both options
    const params = new URLSearchParams(searchParams);
    params.set('view', newView);
    setLocation(`/features/calendar?${params.toString()}`);
  };
  
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


          {/* Main Economic Calendar Section */}
          <section 
            data-testid="econ-section"
            className="space-y-6"
          >
            {/* Summary KPIs - Shared across both views */}
            <EconSummary events={events} isLoading={isLoading} />

            {/* Filters - Shared across both views */}
            <EconFilters 
              filters={filters} 
              onFiltersChange={setFilters}
              activeFilterCount={activeFilterCount}
            />

            {/* View Toggle - Right above event list */}
            <div className="flex justify-end">
              <ToggleGroup 
                type="single" 
                value={currentView} 
                onValueChange={handleViewChange}
                className="border border-border rounded-lg p-1 bg-card"
                data-testid="view-toggle"
              >
                <ToggleGroupItem 
                  value="list" 
                  aria-label="List view"
                  className="px-4 h-9 gap-2"
                  data-testid="button-view-list"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">List</span>
                </ToggleGroupItem>
                <ToggleGroupItem 
                  value="grid" 
                  aria-label="Grid view"
                  className="px-4 h-9 gap-2"
                  data-testid="button-view-grid"
                >
                  <Grid3x3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Grid</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Conditional rendering based on view */}
            {currentView === 'list' ? (
              /* LIST VIEW - Existing implementation */
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
            ) : (
              /* GRID VIEW - Monthly calendar grid */
              <EconCalendarGrid filters={filters} />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
