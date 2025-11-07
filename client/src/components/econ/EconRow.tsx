/**
 * Economic Calendar Event Row
 * Displays comprehensive event details with badges, chips, and data points
 */

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";
import { 
  formatEventDate, 
  getCountryFlag, 
  getImpactScoreColor, 
  getConfidenceColor,
  ECON_IMPORTANCE_COLORS,
  ECON_CATEGORY_LABELS,
} from "@/lib/econ";
import type { EconEvent } from "@shared/schema";
import { format } from "date-fns";

interface EconRowProps {
  event: EconEvent;
}

export function EconRow({ event }: EconRowProps) {
  // Get local time for tooltip
  const localTime = format(new Date(event.datetime_utc), "PPpp");
  
  return (
    <div
      className="p-4 border border-border/50 rounded-lg bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/10 transition-all group"
      data-testid={`econ-event-${event.id}`}
      role="article"
      aria-label={`${event.title} - ${event.importance} importance event`}
    >
      {/* Header Row: Title, Country, Time */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Country Flag */}
            <span 
              className="text-xl"
              aria-label={`Country: ${event.country}`}
              title={event.country}
            >
              {getCountryFlag(event.country)}
            </span>
            
            {/* Event Title */}
            <h3 
              className="font-semibold text-foreground text-base truncate"
              title={event.title}
            >
              {event.title}
            </h3>
          </div>
          
          {/* Category Badge */}
          <Badge 
            variant="outline" 
            className="text-xs h-5"
            data-testid={`event-category-${event.id}`}
            aria-label={`Category: ${ECON_CATEGORY_LABELS[event.category].label}`}
            title={ECON_CATEGORY_LABELS[event.category].description}
          >
            {ECON_CATEGORY_LABELS[event.category].label}
          </Badge>
        </div>

        {/* Date/Time with Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-help"
                data-testid={`event-time-${event.id}`}
              >
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="font-mono">
                  {format(new Date(event.datetime_utc), "MMM d, HH:mm")}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="text-xs space-y-1">
                <p className="font-semibold">UTC: {formatEventDate(event.datetime_utc)}</p>
                <p>Local: {localTime}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Badges Row: Importance, Impact, Confidence, Status */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Importance */}
        <Badge 
          variant={ECON_IMPORTANCE_COLORS[event.importance] as any}
          className="h-6"
          data-testid={`event-importance-${event.id}`}
          aria-label={`Importance: ${event.importance}`}
        >
          {event.importance === 'High' && <AlertCircle className="w-3 h-3 mr-1" aria-hidden="true" />}
          {event.importance}
        </Badge>

        {/* Impact Score */}
        <Badge 
          className={`${getImpactScoreColor(event.impactScore)} h-6`}
          data-testid={`event-impact-${event.id}`}
          aria-label={`Impact score: ${event.impactScore} out of 100`}
        >
          <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
          Impact: {event.impactScore}
        </Badge>

        {/* Confidence */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                className={`${getConfidenceColor(event.confidence)} h-6 cursor-help`}
                data-testid={`event-confidence-${event.id}`}
                aria-label={`AI confidence: ${event.confidence}%`}
              >
                <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                {event.confidence}%
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">AI Model Confidence</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Status */}
        <Badge 
          variant="outline"
          className={
            event.status === 'upcoming' 
              ? "bg-blue-900/20 text-blue-300 border-blue-800 h-6"
              : "bg-green-900/20 text-green-300 border-green-800 h-6"
          }
          data-testid={`event-status-${event.id}`}
          aria-label={`Status: ${event.status}`}
        >
          {event.status === 'upcoming' ? (
            <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
          ) : (
            <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
          )}
          {event.status === 'upcoming' ? 'Upcoming' : 'Released'}
        </Badge>
      </div>

      {/* Data Points: Previous / Forecast / Actual */}
      {(event.previous !== null || event.forecast !== null || event.actual !== null) && (
        <div className="grid grid-cols-3 gap-3 text-sm">
          {/* Previous */}
          <div 
            className="flex flex-col"
            data-testid={`event-previous-${event.id}`}
          >
            <span className="text-xs text-muted-foreground mb-0.5">Previous</span>
            <span className="font-mono text-foreground">
              {event.previous !== null ? event.previous.toLocaleString() : '—'}
            </span>
          </div>

          {/* Forecast */}
          <div 
            className="flex flex-col"
            data-testid={`event-forecast-${event.id}`}
          >
            <span className="text-xs text-muted-foreground mb-0.5">Forecast</span>
            <span className="font-mono text-foreground">
              {event.forecast !== null ? event.forecast.toLocaleString() : '—'}
            </span>
          </div>

          {/* Actual */}
          <div 
            className="flex flex-col"
            data-testid={`event-actual-${event.id}`}
          >
            <span className="text-xs text-muted-foreground mb-0.5">Actual</span>
            <span className={`font-mono ${
              event.actual !== null 
                ? event.actual > (event.forecast || 0) 
                  ? 'text-green-400' 
                  : event.actual < (event.forecast || 0)
                    ? 'text-red-400'
                    : 'text-foreground'
                : 'text-muted-foreground'
            }`}>
              {event.actual !== null ? event.actual.toLocaleString() : event.status === 'upcoming' ? 'Pending' : '—'}
            </span>
          </div>
        </div>
      )}

      {/* Sparkline Placeholder (for released events) */}
      {event.status === 'released' && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-8 bg-muted/10 rounded border border-dashed border-muted-foreground/20 flex items-center justify-center">
              <span className="text-xs text-muted-foreground">
                📊 Price impact sparkline (Phase 2)
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
