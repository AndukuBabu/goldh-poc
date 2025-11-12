/**
 * Economic Calendar - Grid View Controller
 * Main orchestrator for the monthly calendar grid view
 * Manages state, data fetching, event bucketing, and user interactions
 * Enhanced with keyboard navigation and accessibility
 */

import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getEconEventsMock, type EconEvent } from "@/lib/econ";
import {
  getMonthMatrixUTC,
  getMonthBoundsUTC,
  getPreviousMonthUTC,
  getNextMonthUTC,
  getTodayUTC,
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
  
  // State: Focused day index (preserved across month changes)
  const [focusedDayIndex, setFocusedDayIndex] = useState<number>(0);
  
  // State: Mobile drawer
  const [drawerDateISO, setDrawerDateISO] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Ref: Store reference to the cell that opened the drawer (for focus restoration)
  const drawerOriginCellRef = useRef<HTMLDivElement | null>(null);

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
      // Extract date portion from date (YYYY-MM-DD)
      const dateKey = event.date.split('T')[0];
      
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(event);
    });

    // Sort events within each day by time, then impact
    map.forEach((dayEvents, dateKey) => {
      dayEvents.sort((a, b) => {
        // Sort by time first
        const timeA = new Date(a.date).getTime();
        const timeB = new Date(b.date).getTime();
        if (timeA !== timeB) return timeA - timeB;
        
        // Then by impact (High > Medium > Low > Holiday)
        const impactOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2, Holiday: 3 };
        return impactOrder[a.impact] - impactOrder[b.impact];
      });
    });

    return map;
  }, [events]);

  // Initialize focus to today when component mounts
  useEffect(() => {
    if (!focusedISO && matrix.length > 0) {
      const today = getTodayUTC();
      const flatDates = matrix.flat();
      const todayIndex = flatDates.indexOf(today);
      
      if (todayIndex >= 0) {
        setFocusedISO(today);
        setFocusedDayIndex(todayIndex);
      } else {
        // Today not in view, focus first day of current month
        const firstDayOfMonth = matrix.flat().find(date => {
          const [year, month] = date.split('-').map(Number);
          const anchorYear = anchorDate.getUTCFullYear();
          const anchorMonth = anchorDate.getUTCMonth() + 1;
          return year === anchorYear && month === anchorMonth;
        });
        
        if (firstDayOfMonth) {
          const index = flatDates.indexOf(firstDayOfMonth);
          setFocusedISO(firstDayOfMonth);
          setFocusedDayIndex(index);
        }
      }
    }
  }, [matrix, anchorDate, focusedISO]);

  // Handle month navigation
  const handleNavigate = (newDate: Date) => {
    setAnchorDate(newDate);
    // Keep focus on same day index when changing months
    const newMatrix = getMonthMatrixUTC(newDate);
    const flatDates = newMatrix.flat();
    const newFocusIndex = Math.min(focusedDayIndex, flatDates.length - 1);
    setFocusedISO(flatDates[newFocusIndex]);
  };

  // Handle month change from keyboard (PageUp/PageDown)
  const handleMonthChange = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' 
      ? getPreviousMonthUTC(anchorDate) 
      : getNextMonthUTC(anchorDate);
    
    handleNavigate(newDate);
  };

  // Handle day cell focus (keyboard navigation)
  const handleDayFocus = (dateISO: string) => {
    setFocusedISO(dateISO);
    // Update focused day index
    const flatDates = matrix.flat();
    const index = flatDates.indexOf(dateISO);
    if (index >= 0) {
      setFocusedDayIndex(index);
    }
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

  // Handle drawer close with focus restoration
  const handleDrawerClose = () => {
    setDrawerOpen(false);
    
    // Restore focus to the originating cell
    if (drawerOriginCellRef.current) {
      drawerOriginCellRef.current.focus();
    }
    
    // Delay clearing dateISO to allow exit animation
    setTimeout(() => {
      setDrawerDateISO(null);
      drawerOriginCellRef.current = null;
    }, 300);
  };
  
  // Handle setting the origin cell ref when drawer opens
  const handleSetOriginRef = (ref: HTMLDivElement | null) => {
    drawerOriginCellRef.current = ref;
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
        onMonthChange={handleMonthChange}
        onSetOriginRef={handleSetOriginRef}
      />

      {/* Keyboard Shortcuts Help */}
      <div className="text-xs text-muted-foreground text-center space-y-1 pt-2">
        <p>
          <span className="font-semibold">Keyboard shortcuts:</span>{' '}
          Arrow keys to navigate • Enter/Space to open • Home/End for week start/end • PageUp/PageDown to change months
        </p>
      </div>

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
