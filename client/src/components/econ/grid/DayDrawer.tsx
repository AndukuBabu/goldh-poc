/**
 * Economic Calendar Grid - Day Drawer (Mobile)
 * Bottom sheet drawer showing all events for a selected day
 * Enhanced with compact EconRow anatomy and deep linking to List view
 */

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Clock, TrendingUp, CheckCircle, AlertTriangle, Info, Circle, ExternalLink } from "lucide-react";
import { formatTimeUTC, formatDateUTC } from "@/lib/econDate";
import { 
  getCountryFlag, 
  getImpactScoreColor, 
  getConfidenceColor,
  ECON_CATEGORY_LABELS,
} from "@/lib/econ";
import type { EconEvent } from "@/lib/econ";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface DayDrawerProps {
  dateISO: string | null;
  events: EconEvent[];
  open: boolean;
  onClose: () => void;
}

export function DayDrawer({ dateISO, events, open, onClose }: DayDrawerProps) {
  if (!dateISO) return null;

  // Sort events by time, then importance
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.datetime_utc).getTime();
    const timeB = new Date(b.datetime_utc).getTime();
    if (timeA !== timeB) return timeA - timeB;
    
    const importanceOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });

  // Handle "View in List" navigation with date filters
  const handleViewInList = () => {
    // Navigate to List view with single-day filter (from=to=dateISO)
    window.location.href = `/features/calendar?view=list&from=${dateISO}&to=${dateISO}`;
  };

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent 
        side="bottom" 
        className="h-[70vh] border-t-2 border-primary/20"
        data-testid="grid-day-drawer"
      >
        <SheetHeader className="border-b border-border pb-4 mb-4">
          <SheetTitle className="text-foreground">
            {formatDateUTC(dateISO)}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''} scheduled
          </SheetDescription>
        </SheetHeader>

        {/* Event List - Scrollable */}
        <div className="overflow-y-auto h-[calc(70vh-180px)] space-y-3 pb-4">
          {sortedEvents.length > 0 ? (
            sortedEvents.map((event) => (
              <CompactEventCard key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No events scheduled for this day
            </div>
          )}
        </div>

        {/* Footer - View in List */}
        <div className="border-t border-border pt-4">
          <Button
            variant="default"
            className="w-full"
            data-testid={`button-view-day-list-${dateISO}`}
            onClick={handleViewInList}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View this day in List
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

/**
 * Compact Event Card - Matches EconRow anatomy
 * Shows: Title, Time (UTC + local tooltip), Importance, Impact, Confidence, Status
 */
function CompactEventCard({ event }: { event: EconEvent }) {
  // Get local time for tooltip
  const localTime = format(new Date(event.datetime_utc), "PPpp");
  const timeUTC = formatTimeUTC(event.datetime_utc);
  
  // Get importance icon (shape-based, not just color)
  const ImportanceIcon = event.importance === 'High' 
    ? AlertTriangle  // Filled triangle for High
    : event.importance === 'Medium'
    ? Info           // Outlined info for Medium
    : Circle;        // Small circle for Low

  return (
    <div 
      className="p-3 border border-border rounded-lg bg-card hover-elevate transition-all"
      data-testid={`drawer-event-${event.id}`}
      role="article"
      aria-label={`${event.title}, ${event.importance} importance event from ${event.country}`}
    >
      {/* Header: Country Flag + Title */}
      <div className="flex items-start gap-2 mb-2">
        <span 
          className="text-lg flex-shrink-0"
          role="img"
          aria-label={`Country: ${event.country}`}
          title={event.country}
        >
          {getCountryFlag(event.country)}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground leading-tight mb-1">
            {event.title}
          </h4>
          {/* Category Badge */}
          <Badge 
            variant="outline" 
            className="text-xs h-5 bg-primary/5 border-primary/20 text-foreground"
          >
            {ECON_CATEGORY_LABELS[event.category].label}
          </Badge>
        </div>
      </div>

      {/* Time with UTC/Local Tooltip */}
      <div className="mb-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-help"
                tabIndex={0}
              >
                <Clock className="w-3 h-3 text-primary" aria-hidden="true" />
                <span className="font-mono">{timeUTC} UTC</span>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="text-xs space-y-1">
                <p className="font-semibold">UTC: {timeUTC}</p>
                <p>Local: {localTime}</p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Badges: Importance, Impact, Confidence, Status */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Importance */}
        <Badge 
          variant={
            event.importance === 'High' 
              ? 'destructive' 
              : event.importance === 'Medium'
              ? 'default'
              : 'secondary'
          }
          className="h-6 text-xs"
          aria-label={`Importance level: ${event.importance}`}
        >
          <ImportanceIcon className="w-3 h-3 mr-1" aria-hidden="true" />
          {event.importance}
        </Badge>

        {/* Impact Score */}
        <Badge 
          className={`${getImpactScoreColor(event.impactScore)} h-6 text-xs`}
          aria-label={`AI predicted impact score: ${event.impactScore} out of 100`}
        >
          <TrendingUp className="w-3 h-3 mr-1" aria-hidden="true" />
          {event.impactScore}
        </Badge>

        {/* Confidence */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge 
                className={`${getConfidenceColor(event.confidence)} h-6 text-xs cursor-help`}
                aria-label={`AI model confidence level: ${event.confidence} percent`}
                tabIndex={0}
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
              ? "bg-blue-900/20 text-blue-300 border-blue-800 h-6 text-xs"
              : "bg-green-900/20 text-green-300 border-green-800 h-6 text-xs"
          }
          aria-label={`Event status: ${event.status === 'upcoming' ? 'Upcoming' : 'Released'}`}
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
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Prev</div>
            <div className="font-mono font-semibold text-foreground">
              {event.previous ?? '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Fcst</div>
            <div className="font-mono font-semibold text-foreground">
              {event.forecast ?? '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Actual</div>
            <div className={cn(
              "font-mono font-semibold",
              event.actual !== null && event.forecast !== null
                ? event.actual > event.forecast
                  ? "text-green-500"
                  : event.actual < event.forecast
                  ? "text-red-500"
                  : "text-foreground"
                : "text-muted-foreground"
            )}>
              {event.status === 'released' 
                ? (event.actual ?? '-') 
                : 'Pending'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
