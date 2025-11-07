/**
 * Economic Calendar Grid - Main Calendar Grid
 * Renders 7×6 grid of day cells with weekday headers
 * Enhanced with full keyboard navigation and accessibility
 */

import { useEffect, useCallback } from "react";
import { DayCell } from "./DayCell";
import type { EconEvent } from "@/lib/econ";
import { isTodayUTC, isCurrentMonthUTC, getTodayUTC } from "@/lib/econDate";

interface CalendarGridProps {
  matrix: string[][]; // 6×7 array of ISO date strings (YYYY-MM-DD)
  eventsByDay: Map<string, EconEvent[]>;
  anchorDate: Date;
  focusedDate: string | null;
  onDayFocus: (dateISO: string) => void;
  onDayClick: (dateISO: string) => void;
  onMonthChange: (direction: 'prev' | 'next') => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({
  matrix,
  eventsByDay,
  anchorDate,
  focusedDate,
  onDayFocus,
  onDayClick,
  onMonthChange,
}: CalendarGridProps) {
  // Flatten matrix to 1D array for easier navigation
  const flatDates = matrix.flat();

  // Get current focused index or default to today
  const getFocusedIndex = useCallback(() => {
    if (focusedDate) {
      return flatDates.indexOf(focusedDate);
    }
    // Default to today if it's in the current view
    const today = getTodayUTC();
    const todayIndex = flatDates.indexOf(today);
    return todayIndex >= 0 ? todayIndex : 0;
  }, [focusedDate, flatDates]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: KeyboardEvent, currentIndex: number) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = Math.max(0, currentIndex - 1);
        break;
      
      case 'ArrowRight':
        e.preventDefault();
        newIndex = Math.min(flatDates.length - 1, currentIndex + 1);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        newIndex = Math.max(0, currentIndex - 7);
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        newIndex = Math.min(flatDates.length - 1, currentIndex + 7);
        break;
      
      case 'Home':
        e.preventDefault();
        // Jump to start of week (same row)
        const weekRow = Math.floor(currentIndex / 7);
        newIndex = weekRow * 7;
        break;
      
      case 'End':
        e.preventDefault();
        // Jump to end of week (same row)
        const currentWeekRow = Math.floor(currentIndex / 7);
        newIndex = (currentWeekRow * 7) + 6;
        break;
      
      case 'PageUp':
        e.preventDefault();
        // Previous month, keep same day index
        onMonthChange('prev');
        return; // Don't update focus here, parent will handle
      
      case 'PageDown':
        e.preventDefault();
        // Next month, keep same day index
        onMonthChange('next');
        return; // Don't update focus here, parent will handle
      
      default:
        return;
    }

    // Update focus if index changed
    if (newIndex !== currentIndex) {
      onDayFocus(flatDates[newIndex]);
    }
  }, [flatDates, onDayFocus, onMonthChange]);

  return (
    <div
      role="grid"
      aria-label={`Economic events calendar for ${anchorDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' })}`}
      aria-readonly="true"
      className="border border-border rounded-lg overflow-hidden bg-card"
      data-testid="grid-calendar"
    >
      {/* Weekday Headers */}
      <div 
        role="row" 
        className="grid grid-cols-7 border-b border-border bg-muted/30"
      >
        {WEEKDAY_LABELS.map((day) => (
          <div
            key={day}
            role="columnheader"
            className="p-2 text-center text-sm font-medium text-muted-foreground"
            aria-label={day}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Weeks */}
      {matrix.map((week, weekIndex) => (
        <div 
          key={weekIndex} 
          role="row" 
          className="grid grid-cols-7 border-b border-border last:border-b-0"
        >
          {week.map((dateISO, dayIndex) => {
            const dayEvents = eventsByDay.get(dateISO) || [];
            const isToday = isTodayUTC(dateISO);
            const isCurrentMonth = isCurrentMonthUTC(dateISO, anchorDate);
            const isFocused = focusedDate === dateISO;
            const flatIndex = weekIndex * 7 + dayIndex;

            return (
              <DayCell
                key={dateISO}
                dateISO={dateISO}
                events={dayEvents}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
                isFocused={isFocused}
                tabIndex={isFocused ? 0 : -1}
                onFocus={() => onDayFocus(dateISO)}
                onClick={() => onDayClick(dateISO)}
                onKeyDown={(e) => handleKeyDown(e, flatIndex)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
