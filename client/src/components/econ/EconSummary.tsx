/**
 * Economic Calendar Summary KPIs
 * Displays key metrics: total events, high-impact count, next release time
 */

import { Card, CardContent } from "@/components/ui/card";
import { Calendar, TrendingUp, Clock } from "lucide-react";
import { formatEventDate, getRelativeTime } from "@/lib/econ";
import type { EconEvent } from "@shared/schema";

interface EconSummaryProps {
  events?: EconEvent[];
  isLoading?: boolean;
}

export function EconSummary({ events = [], isLoading = false }: EconSummaryProps) {
  // Calculate KPIs
  const totalEvents = events.length;
  const highImpactCount = events.filter(e => e.impactScore >= 70).length;
  
  // Find next upcoming release (earliest future event)
  const upcomingEvents = events
    .filter(e => e.status === 'upcoming')
    .sort((a, b) => new Date(a.datetime_utc).getTime() - new Date(b.datetime_utc).getTime());
  
  const nextRelease = upcomingEvents[0];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="border-primary/20 bg-card/50 animate-pulse">
            <CardContent className="pt-6">
              <div className="h-16 bg-muted/20 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div 
      className="grid grid-cols-1 md:grid-cols-3 gap-4"
      data-testid="econ-summary"
      role="region"
      aria-label="Economic Calendar Summary Statistics"
    >
      {/* Total Events */}
      <Card className="border-primary/20 bg-card/50 hover-elevate transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center"
              aria-hidden="true"
            >
              <Calendar className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p 
                className="text-2xl font-bold text-foreground"
                data-testid="stat-total-events"
                aria-label={`${totalEvents} total events`}
              >
                {totalEvents}
              </p>
              <p className="text-sm text-muted-foreground">Total Events</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* High Impact Count */}
      <Card className="border-primary/20 bg-card/50 hover-elevate transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg bg-red-900/20 border border-red-800/30 flex items-center justify-center"
              aria-hidden="true"
            >
              <TrendingUp className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p 
                className="text-2xl font-bold text-foreground"
                data-testid="stat-high-impact"
                aria-label={`${highImpactCount} high impact events`}
              >
                {highImpactCount}
              </p>
              <p className="text-sm text-muted-foreground">High Impact</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Release */}
      <Card className="border-primary/20 bg-card/50 hover-elevate transition-all">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg bg-blue-900/20 border border-blue-800/30 flex items-center justify-center"
              aria-hidden="true"
            >
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              {nextRelease ? (
                <>
                  <p 
                    className="text-base font-semibold text-foreground truncate"
                    data-testid="stat-next-release-time"
                    aria-label={`Next release: ${nextRelease.title}`}
                    title={nextRelease.title}
                  >
                    {getRelativeTime(nextRelease.datetime_utc)}
                  </p>
                  <p className="text-xs text-muted-foreground truncate" title={nextRelease.title}>
                    {nextRelease.title}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-base font-semibold text-muted-foreground">
                    No upcoming
                  </p>
                  <p className="text-xs text-muted-foreground">
                    All events released
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
