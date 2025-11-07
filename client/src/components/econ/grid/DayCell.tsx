/**
 * Economic Calendar Grid - Day Cell
 * Individual cell in the calendar grid showing date and event indicators
 */

import { cn } from "@/lib/utils";
import { EventDot } from "./EventDot";
import type { EconEvent } from "@/lib/econ";
import { toLocalTooltip } from "@/lib/econDate";

interface DayCellProps {
  dateISO: string; // YYYY-MM-DD
  events: EconEvent[];
  isToday: boolean;
  isCurrentMonth: boolean;
  isFocused: boolean;
  onFocus: () => void;
  onClick: () => void;
}

export function DayCell({
  dateISO,
  events,
  isToday,
  isCurrentMonth,
  isFocused,
  onFocus,
  onClick,
}: DayCellProps) {
  // Extract day number from ISO date (YYYY-MM-DD)
  const dayNumber = parseInt(dateISO.split('-')[2], 10);

  // Sort events by importance (High -> Medium -> Low) then by time
  const sortedEvents = [...events].sort((a, b) => {
    const importanceOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    const importanceDiff = importanceOrder[a.importance] - importanceOrder[b.importance];
    if (importanceDiff !== 0) return importanceDiff;
    
    return new Date(a.datetime_utc).getTime() - new Date(b.datetime_utc).getTime();
  });

  // Show up to 3 events
  const visibleEvents = sortedEvents.slice(0, 3);
  const remainingCount = Math.max(0, events.length - 3);

  // Build accessible label
  const eventSummary = visibleEvents.length > 0
    ? visibleEvents.map(e => `${e.importance} importance: ${e.title}`).join(', ')
    : 'No events';
  
  const ariaLabel = `${toLocalTooltip(dateISO)}, ${events.length} events. ${eventSummary}. ${remainingCount > 0 ? `${remainingCount} more events.` : ''} Press Enter to view details.`;

  return (
    <div
      role="gridcell"
      tabIndex={0}
      aria-selected={isFocused}
      aria-label={ariaLabel}
      onClick={onClick}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] p-2 border-r border-b border-border last:border-r-0",
        "cursor-pointer transition-all",
        "hover-elevate focus:outline-none",
        isCurrentMonth ? "bg-card" : "bg-muted/30",
        isToday && "border-2 border-primary",
        isFocused && "ring-2 ring-primary ring-offset-2 ring-offset-background",
        events.length > 0 && "hover:shadow-sm"
      )}
      data-testid={`grid-day-cell-${dateISO}`}
    >
      {/* Date Number */}
      <div
        className={cn(
          "text-sm font-medium mb-1",
          isCurrentMonth ? "text-foreground" : "text-muted-foreground",
          isToday && "text-primary font-bold"
        )}
      >
        {dayNumber}
      </div>

      {/* Event Indicators */}
      <div className="space-y-1">
        {visibleEvents.map((event) => (
          <EventDot key={event.id} event={event} />
        ))}
      </div>

      {/* +N more indicator */}
      {remainingCount > 0 && (
        <div
          className="text-xs text-primary mt-1 font-medium"
          aria-hidden="true"
        >
          +{remainingCount} more
        </div>
      )}
    </div>
  );
}
