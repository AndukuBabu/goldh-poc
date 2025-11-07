/**
 * Economic Calendar Grid - Day Cell
 * Individual cell in the calendar grid showing date and event indicators
 * Enhanced with keyboard navigation and accessibility
 * Performance optimized with lazy-mounted popover
 */

import { useRef, useState, useMemo, useEffect } from "react";
import { cn } from "@/lib/utils";
import { EventDot } from "./EventDot";
import { EventPopover } from "./EventPopover";
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
  
  // Performance: Lazy-mount popover only on hover/focus (desktop only)
  const [isHovered, setIsHovered] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  
  // Detect desktop/mobile responsively
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 768
  );
  
  // Update isDesktop on resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Extract day number from ISO date (YYYY-MM-DD)
  const dayNumber = parseInt(dateISO.split('-')[2], 10);

  // Performance: Memoize sorted events with stable deps
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const importanceOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
      const importanceDiff = importanceOrder[a.importance] - importanceOrder[b.importance];
      if (importanceDiff !== 0) return importanceDiff;
      
      return new Date(a.datetime_utc).getTime() - new Date(b.datetime_utc).getTime();
    });
  }, [events]);

  // Limit to 3 visible event dots
  const visibleEvents = useMemo(() => sortedEvents.slice(0, 3), [sortedEvents]);
  const remainingCount = Math.max(0, events.length - 3);

  // Build accessible label
  const eventSummary = visibleEvents.length > 0
    ? visibleEvents.map(e => `${e.importance} importance: ${e.title}`).join(', ')
    : 'No events';
  
  const ariaLabel = `${toLocalTooltip(dateISO)}, ${events.length} event${events.length !== 1 ? 's' : ''}. ${eventSummary}. ${remainingCount > 0 ? `${remainingCount} more event${remainingCount !== 1 ? 's' : ''}.` : ''} Press Enter to view details.`;

  // Performance: Lazy-mount popover only when needed
  const shouldRenderPopover = isDesktop && events.length > 0 && (isHovered || isFocused);
  
  // Auto-open popover when hovering (lazy-mount + open)
  useEffect(() => {
    if (isDesktop && events.length > 0 && isHovered) {
      setPopoverOpen(true);
    }
  }, [isDesktop, events.length, isHovered]);
  
  const cellContent = (
    <div
      ref={cellRef}
      role="gridcell"
      tabIndex={tabIndex}
      aria-selected={isFocused}
      aria-label={ariaLabel}
      onClick={() => {
        // Desktop: let popover handle click (already visible on hover)
        // Mobile/no-events: open drawer
        if (!isDesktop || events.length === 0) {
          onSetOriginRef(cellRef.current);
          onClick();
        }
      }}
      onFocus={onFocus}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setPopoverOpen(false);
      }}
      onKeyDown={(e) => {
        // Handle Enter/Space to open drawer (desktop) or trigger drawer (mobile)
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          
          // On desktop with events, popover is visible on focus, Enter/Space opens drawer
          // On mobile or no events, open drawer
          if (events.length > 0) {
            onSetOriginRef(cellRef.current);
            onClick();
          }
          return;
        }
        // Pass other keys to parent for navigation
        onKeyDown(e);
      }}
      className={cn(
        "min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] p-2 border-r border-b border-[#2a2a2a] last:border-r-0",
        "cursor-pointer transition-all",
        "hover-elevate focus:outline-none",
        isCurrentMonth ? "bg-[#0a0a0a]" : "bg-black/20",
        isToday && "border-2 border-[#C7AE6A]",
        isFocused && "ring-2 ring-[#C7AE6A] ring-offset-2 ring-offset-[#111]",
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
  
  // Performance: Lazy-mount EventPopover only on hover/focus (desktop only)
  if (shouldRenderPopover) {
    return (
      <EventPopover
        dateISO={dateISO}
        events={events}
        open={popoverOpen}
        onOpenChange={setPopoverOpen}
      >
        {cellContent}
      </EventPopover>
    );
  }
  
  return cellContent;
}
