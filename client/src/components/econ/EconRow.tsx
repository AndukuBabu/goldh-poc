/**
 * Economic Calendar Event Row
 * Displays comprehensive event details with badges, chips, and data points
 * Fully accessible with ARIA labels, keyboard navigation, and icon shapes
 */

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, AlertTriangle, Info, Circle, Calendar } from "lucide-react";
import { 
  formatEventDate, 
  getCountryFlag,
} from "@/lib/econ";
import type { EconEvent } from "@shared/schema";
import { format } from "date-fns";

interface EconRowProps {
  event: EconEvent;
}

export function EconRow({ event }: EconRowProps) {
  // Get local time for tooltip
  const localTime = format(new Date(event.date), "PPpp");
  
  // Get impact icon (shape-based, not just color)
  const ImpactIcon = event.impact === 'High' 
    ? AlertTriangle  // Filled triangle for High
    : event.impact === 'Medium'
    ? Info           // Outlined info for Medium
    : event.impact === 'Holiday'
    ? Calendar       // Calendar for Holiday
    : Circle;        // Small circle for Low

  return (
    <div
      className="p-4 border border-border rounded-lg bg-card hover-elevate active-elevate-2 transition-all group"
      data-testid={`econ-event-${event.id}`}
      role="article"
      aria-label={`${event.title}, ${event.impact} impact event from ${event.country}, scheduled for ${formatEventDate(event.date)}`}
      tabIndex={0}
    >
      {/* Header Row: Title, Country, Time */}
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {/* Country Code */}
            <span 
              className="text-xs font-mono font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded"
              aria-label={`Country: ${event.country}`}
              title={event.country}
            >
              {event.country}
            </span>
            
            {/* Event Title */}
            <h3 
              className="font-semibold text-foreground text-base truncate"
              title={event.title}
            >
              {event.title}
            </h3>
          </div>
        </div>

        {/* Date/Time with Tooltip */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center gap-1.5 text-sm text-foreground cursor-help"
                data-testid={`event-time-${event.id}`}
                tabIndex={0}
                aria-label={`Event time: ${formatEventDate(event.date)}`}
              >
                <Clock className="w-3.5 h-3.5 text-primary" aria-hidden="true" />
                <span className="font-mono">
                  {format(new Date(event.date), "MMM d, HH:mm")}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="left">
              <div className="text-xs space-y-1">
                <p className="font-semibold">UTC: {formatEventDate(event.date)}</p>
                <p>Local: {localTime}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Badges Row: Impact Level */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {/* Impact - Icon-based, not just color */}
        <Badge 
          variant={
            event.impact === 'High' 
              ? 'destructive' 
              : event.impact === 'Medium'
              ? 'default'
              : event.impact === 'Holiday'
              ? 'outline'
              : 'secondary'
          }
          className="h-6"
          data-testid={`event-impact-${event.id}`}
          aria-label={`Impact level: ${event.impact}`}
        >
          <ImpactIcon className="w-3 h-3 mr-1" aria-hidden="true" />
          {event.impact}
        </Badge>
      </div>

      {/* Data Points: Previous / Forecast */}
      {(event.previous || event.forecast) && (
        <div 
          className="grid grid-cols-2 gap-3 text-sm"
          role="group"
          aria-label="Economic data values"
        >
          {/* Previous */}
          <div 
            className="flex flex-col"
            data-testid={`event-previous-${event.id}`}
          >
            <span className="text-xs text-muted-foreground mb-0.5" aria-hidden="true">
              Previous
            </span>
            <span 
              className="font-mono text-foreground"
              aria-label={`Previous value: ${event.previous || 'Not available'}`}
            >
              {event.previous || '—'}
            </span>
          </div>

          {/* Forecast */}
          <div 
            className="flex flex-col"
            data-testid={`event-forecast-${event.id}`}
          >
            <span className="text-xs text-muted-foreground mb-0.5" aria-hidden="true">
              Forecast
            </span>
            <span 
              className="font-mono text-foreground"
              aria-label={`Forecast value: ${event.forecast || 'Not available'}`}
            >
              {event.forecast || '—'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
