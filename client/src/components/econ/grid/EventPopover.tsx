/**
 * Economic Calendar Grid - Event Popover (Desktop)
 * Hover/focus popover showing event details for a specific day
 */

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, Circle, ExternalLink } from "lucide-react";
import { formatTimeUTC, formatDateUTC } from "@/lib/econDate";
import type { EconEvent } from "@/lib/econ";
import { cn } from "@/lib/utils";

interface EventPopoverProps {
  dateISO: string;
  events: EconEvent[];
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function EventPopover({ 
  dateISO, 
  events, 
  children,
  open,
  onOpenChange,
}: EventPopoverProps) {
  if (events.length === 0) {
    return <>{children}</>;
  }

  // Sort events by time, then importance
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.datetime_utc).getTime();
    const timeB = new Date(b.datetime_utc).getTime();
    if (timeA !== timeB) return timeA - timeB;
    
    const importanceOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    return importanceOrder[a.importance] - importanceOrder[b.importance];
  });

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border-primary/20"
        data-testid={`grid-day-popover-${dateISO}`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <h3 className="font-semibold text-foreground">
            {formatDateUTC(dateISO)}
          </h3>
          <p className="text-xs text-muted-foreground">
            {events.length} event{events.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Event List */}
        <div className="max-h-[400px] overflow-y-auto">
          {sortedEvents.map((event) => (
            <EventPopoverItem key={event.id} event={event} />
          ))}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-border bg-muted/30">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-primary hover:text-primary"
            data-testid={`link-view-day-list-${dateISO}`}
            onClick={() => {
              // TODO: Navigate to list view filtered to this date
              window.location.href = `/features/calendar?view=list&date=${dateISO}`;
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View day in List
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EventPopoverItem({ event }: { event: EconEvent }) {
  const importanceConfig: Record<string, {
    icon: React.ComponentType<any>;
    color: string;
  }> = {
    High: { icon: AlertTriangle, color: 'text-red-500' },
    Medium: { icon: Info, color: 'text-orange-500' },
    Low: { icon: Circle, color: 'text-yellow-500' },
  };

  const config = importanceConfig[event.importance];
  const Icon = config.icon;

  return (
    <div className="px-4 py-3 border-b border-border last:border-b-0 hover-elevate">
      {/* Time & Title */}
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs font-mono text-muted-foreground mt-0.5">
          {formatTimeUTC(event.datetime_utc)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-3 h-3 flex-shrink-0", config.color)} />
            <span className="text-sm font-medium text-foreground truncate">
              {event.title}
            </span>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <Badge variant="outline" className="text-xs">
          {event.importance}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Impact: {event.impactScore}
        </Badge>
        <Badge variant="secondary" className="text-xs">
          Conf: {event.confidence}%
        </Badge>
      </div>

      {/* Data (Previous / Forecast / Actual) */}
      {(event.previous !== null || event.forecast !== null || event.actual !== null) && (
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Prev</div>
            <div className="font-mono text-foreground">
              {event.previous ?? '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Fcst</div>
            <div className="font-mono text-foreground">
              {event.forecast ?? '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Actual</div>
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
