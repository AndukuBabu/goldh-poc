/**
 * Economic Calendar - Grid View Controller
 * Main orchestrator for the monthly calendar grid view
 * Manages state, data fetching, event bucketing, and user interactions
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEconEventsMock, type EconEvent } from "@/lib/econ";
import {
  getMonthMatrixUTC,
  getMonthBoundsUTC,
  isSameUTCDate,
} from "@/lib/econDate";
import {
  MonthHeader,
  CalendarGrid,
  DayDrawer,
} from "@/components/econ/grid";
import type { EconEventFilters } from "@/lib/econ";

interface EconCalendarGridProps {
  filters?: EconEventFilters;
}

export function EconCalendarGrid({ filters = {} }: EconCalendarGridProps) {
  // State: Current month being viewed
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  
  // State: Currently focused date (for keyboard navigation)
  const [focusedISO, setFocusedISO] = useState<string | null>(null);
  
  // State: Mobile drawer
  const [drawerDateISO, setDrawerDateISO] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Compute 6×7 matrix of ISO date strings for current month
  const matrix = useMemo(() => getMonthMatrixUTC(anchorDate), [anchorDate]);

  // Get date bounds for the visible grid (first Monday to last Sunday)
  const bounds = useMemo(() => getMonthBoundsUTC(anchorDate), [anchorDate]);

  // Fetch events for the visible date range
  const {
    data: events = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/econ/events", bounds.startUtcISO, bounds.endUtcISO, filters],
    queryFn: async () => {
      return getEconEventsMock({
        from: bounds.startUtcISO,
        to: bounds.endUtcISO,
        ...filters,
      });
    },
  });

  // Bucket events by UTC day (YYYY-MM-DD)
  const eventsByDay = useMemo(() => {
    const map = new Map<string, EconEvent[]>();
    
    events.forEach((event) => {
      // Extract date portion from datetime_utc (YYYY-MM-DD)
      const dateKey = event.datetime_utc.split('T')[0];
      
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });

    // Sort events within each day by time, then importance
    map.forEach((dayEvents, dateKey) => {
      dayEvents.sort((a, b) => {
        // Sort by time first
        const timeA = new Date(a.datetime_utc).getTime();
        const timeB = new Date(b.datetime_utc).getTime();
        if (timeA !== timeB) return timeA - timeB;
        
        // Then by importance (High > Medium > Low)
        const importanceOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
        return importanceOrder[a.importance] - importanceOrder[b.importance];
      });
    });

    return map;
  }, [events]);

  // Handle month navigation
  const handleNavigate = (newDate: Date) => {
    setAnchorDate(newDate);
    setFocusedISO(null); // Reset focus when changing months
  };

  // Handle day cell focus (keyboard navigation)
  const handleDayFocus = (dateISO: string) => {
    setFocusedISO(dateISO);
  };

  // Handle day cell click
  const handleDayClick = (dateISO: string) => {
    // Check if this is a mobile device (simple heuristic)
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // Mobile: Open bottom drawer
      setDrawerDateISO(dateISO);
      setDrawerOpen(true);
    } else {
      // Desktop: EventPopover handles hover/focus
      // Click still opens drawer for better UX
      setDrawerDateISO(dateISO);
      setDrawerOpen(true);
    }
  };

  // Handle drawer close
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    // Delay clearing dateISO to allow exit animation
    setTimeout(() => setDrawerDateISO(null), 300);
  };

  // Get events for drawer
  const drawerEvents = drawerDateISO 
    ? (eventsByDay.get(drawerDateISO) || [])
    : [];

  // Loading state
  if (isLoading) {
    return (
      <div 
        className="flex items-center justify-center py-12"
        data-testid="grid-loading"
      >
        <div className="text-center">
          <div className="animate-pulse text-muted-foreground">
            Loading calendar events...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div 
        className="flex items-center justify-center py-12"
        data-testid="grid-error"
      >
        <div className="text-center">
          <div className="text-destructive mb-2">Failed to load events</div>
          <button
            onClick={() => window.location.reload()}
            className="text-primary hover:underline text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="grid-container">
      {/* Month Navigation Header */}
      <MonthHeader
        anchorDate={anchorDate}
        onNavigate={handleNavigate}
      />

      {/* Calendar Grid */}
      <CalendarGrid
        matrix={matrix}
        eventsByDay={eventsByDay}
        anchorDate={anchorDate}
        focusedDate={focusedISO}
        onDayFocus={handleDayFocus}
        onDayClick={handleDayClick}
      />

      {/* Mobile Day Drawer */}
      <DayDrawer
        dateISO={drawerDateISO}
        events={drawerEvents}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  );
}
