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
import { Clock, Calendar, AlertTriangle, Info, Circle, ExternalLink } from "lucide-react";
import { formatTimeUTC, formatDateUTC } from "@/lib/econDate";
import { 
  getCountryFlag,
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

  // Sort events by time, then impact
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (timeA !== timeB) return timeA - timeB;
    
    const impactOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2, Holiday: 3 };
    return impactOrder[a.impact] - impactOrder[b.impact];
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
        className="h-[70vh] border-t-2 border-[#C7AE6A]/20 bg-[#0a0a0a]"
        data-testid="grid-day-drawer"
      >
        <SheetHeader className="border-b border-[#2a2a2a] pb-4 mb-4">
          <SheetTitle className="text-foreground">
            {formatDateUTC(dateISO)}
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''} scheduled
          </SheetDescription>
        </SheetHeader>

        {/* Event List - Performance: Smooth scroll with height constraint */}
        <div className="overflow-y-auto h-[calc(70vh-180px)] space-y-3 pb-4 scroll-smooth">
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
        <div className="border-t border-[#2a2a2a] pt-4">
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
 * Shows: Title, Time (UTC + local tooltip), Impact level, Previous/Forecast data
 */
function CompactEventCard({ event }: { event: EconEvent }) {
  // Get local time for tooltip
  const localTime = format(new Date(event.date), "PPpp");
  const timeUTC = formatTimeUTC(event.date);
  
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
      className="p-3 border border-[#2a2a2a] rounded-lg bg-[#111] hover-elevate transition-all"
      data-testid={`drawer-event-${event.id}`}
      role="article"
      aria-label={`${event.title}, ${event.impact} impact event from ${event.country}`}
    >
      {/* Header: Country Code + Title */}
      <div className="flex items-start gap-2 mb-2">
        <span 
          className="text-xs font-mono font-semibold text-primary px-1.5 py-0.5 bg-primary/10 rounded flex-shrink-0"
          aria-label={`Country: ${event.country}`}
          title={event.country}
        >
          {event.country}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm text-foreground leading-tight">
            {event.title}
          </h4>
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

      {/* Badges: Impact */}
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Impact */}
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
          className="h-6 text-xs"
          aria-label={`Impact level: ${event.impact}`}
        >
          <ImpactIcon className="w-3 h-3 mr-1" aria-hidden="true" />
          {event.impact}
        </Badge>
      </div>

      {/* Data Points: Previous / Forecast */}
      {(event.previous || event.forecast) && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border text-xs">
          <div>
            <div className="text-muted-foreground mb-1">Prev</div>
            <div className="font-mono font-semibold text-foreground">
              {event.previous || '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground mb-1">Fcst</div>
            <div className="font-mono font-semibold text-foreground">
              {event.forecast || '-'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
