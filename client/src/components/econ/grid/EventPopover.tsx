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

  // Sort events by time, then impact
  const sortedEvents = [...events].sort((a, b) => {
    const timeA = new Date(a.date).getTime();
    const timeB = new Date(b.date).getTime();
    if (timeA !== timeB) return timeA - timeB;
    
    const impactOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2, Holiday: 3 };
    return impactOrder[a.impact] - impactOrder[b.impact];
  });

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border-[#C7AE6A]/20 bg-[#0a0a0a]"
        data-testid={`grid-day-popover-${dateISO}`}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-[#2a2a2a] bg-black/30">
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
        <div className="px-4 py-3 border-t border-[#2a2a2a] bg-black/30">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-[#C7AE6A] hover:text-[#d5c28f]"
            data-testid={`link-view-day-list-${dateISO}`}
            onClick={() => {
              // Navigate to list view filtered to this date (from=to for single day)
              window.location.href = `/features/calendar?view=list&from=${dateISO}&to=${dateISO}`;
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
  const impactConfig: Record<string, {
    icon: React.ComponentType<any>;
    color: string;
  }> = {
    High: { icon: AlertTriangle, color: 'text-red-500' },
    Medium: { icon: Info, color: 'text-orange-500' },
    Low: { icon: Circle, color: 'text-yellow-500' },
    Holiday: { icon: Circle, color: 'text-blue-500' },
  };

  const config = impactConfig[event.impact] || impactConfig.Low;
  const Icon = config.icon;

  return (
    <div className="px-4 py-3 border-b border-[#2a2a2a] last:border-b-0 hover-elevate">
      {/* Time & Title */}
      <div className="flex items-start gap-2 mb-2">
        <span className="text-xs font-mono text-muted-foreground mt-0.5">
          {formatTimeUTC(event.date)}
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
          {event.impact}
        </Badge>
      </div>

      {/* Data (Previous / Forecast) */}
      {(event.previous || event.forecast) && (
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <div className="text-muted-foreground">Prev</div>
            <div className="font-mono text-foreground">
              {event.previous || '-'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Fcst</div>
            <div className="font-mono text-foreground">
              {event.forecast || '-'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
