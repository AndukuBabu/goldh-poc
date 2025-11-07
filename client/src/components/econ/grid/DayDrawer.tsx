/**
 * Economic Calendar Grid - Day Drawer (Mobile)
 * Bottom sheet drawer showing all events for a selected day
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
import { Card } from "@/components/ui/card";
import { AlertTriangle, Info, Circle, ExternalLink } from "lucide-react";
import { formatTimeUTC, formatDateUTC } from "@/lib/econDate";
import type { EconEvent } from "@/lib/econ";
import { cn } from "@/lib/utils";

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
              <EventDrawerCard key={event.id} event={event} />
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
            data-testid={`link-view-day-list-${dateISO}`}
            onClick={() => {
              window.location.href = `/features/calendar?view=list&date=${dateISO}`;
            }}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View day in List
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function EventDrawerCard({ event }: { event: EconEvent }) {
  const importanceConfig: Record<string, {
    icon: React.ComponentType<any>;
    color: string;
    bgColor: string;
  }> = {
    High: { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500/10' },
    Medium: { icon: Info, color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
    Low: { icon: Circle, color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  };

  const config = importanceConfig[event.importance];
  const Icon = config.icon;

  return (
    <Card className="p-4 border-primary/20 hover-elevate">
      {/* Header: Time + Importance Icon */}
      <div className="flex items-start gap-3 mb-3">
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          config.bgColor
        )}>
          <Icon className={cn("w-5 h-5", config.color)} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-muted-foreground">
              {formatTimeUTC(event.datetime_utc)} UTC
            </span>
            <Badge variant="outline" className="text-xs">
              {event.importance}
            </Badge>
          </div>
          <h4 className="text-sm font-semibold text-foreground">
            {event.title}
          </h4>
        </div>
      </div>

      {/* Metrics */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Impact:</span>
          <Badge variant="secondary" className="text-xs">
            {event.impactScore}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Confidence:</span>
          <Badge variant="secondary" className="text-xs">
            {event.confidence}%
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">Status:</span>
          <Badge 
            variant={event.status === 'released' ? 'default' : 'outline'}
            className="text-xs"
          >
            {event.status === 'released' ? 'Released' : 'Upcoming'}
          </Badge>
        </div>
      </div>

      {/* Data Grid */}
      {(event.previous !== null || event.forecast !== null || event.actual !== null) && (
        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
          <div>
            <div className="text-xs text-muted-foreground mb-1">Previous</div>
            <div className="text-sm font-mono font-semibold text-foreground">
              {event.previous ?? '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Forecast</div>
            <div className="text-sm font-mono font-semibold text-foreground">
              {event.forecast ?? '-'}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground mb-1">Actual</div>
            <div className={cn(
              "text-sm font-mono font-semibold",
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
    </Card>
  );
}
