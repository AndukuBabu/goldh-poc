/**
 * Economic Calendar Grid - Day Cell
 * Individual cell in the calendar grid showing date and event indicators
 * Enhanced with keyboard navigation and accessibility
 */

import { useRef } from "react";
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
  tabIndex: number;
  onFocus: () => void;
  onClick: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onSetOriginRef: (ref: HTMLDivElement | null) => void;
}

export function DayCell({
  dateISO,
  events,
  isToday,
  isCurrentMonth,
  isFocused,
  tabIndex,
  onFocus,
  onClick,
  onKeyDown,
  onSetOriginRef,
}: DayCellProps) {
  // Ref to this cell for focus restoration
  const cellRef = useRef<HTMLDivElement>(null);
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
  
  const ariaLabel = `${toLocalTooltip(dateISO)}, ${events.length} event${events.length !== 1 ? 's' : ''}. ${eventSummary}. ${remainingCount > 0 ? `${remainingCount} more event${remainingCount !== 1 ? 's' : ''}.` : ''} Press Enter to view details.`;

  return (
    <div
      ref={cellRef}
      role="gridcell"
      tabIndex={tabIndex}
      aria-selected={isFocused}
      aria-label={ariaLabel}
      onClick={() => {
        // Store ref for focus restoration
        onSetOriginRef(cellRef.current);
        onClick();
      }}
      onFocus={onFocus}
      onKeyDown={(e) => {
        // Handle Enter/Space to open drawer
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          // Store ref for focus restoration
          onSetOriginRef(cellRef.current);
          onClick();
          return;
        }
        // Pass other keys to parent for navigation
        onKeyDown(e);
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
        {visibleEvents.map((event, index) => (
          <EventDot 
            key={event.id} 
            event={event}
            tabIndex={isFocused ? 0 : -1}
            cellDateISO={dateISO}
          />
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
