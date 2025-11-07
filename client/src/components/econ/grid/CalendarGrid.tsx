/**
 * Economic Calendar Grid - Main Calendar Grid
 * Renders 7×6 grid of day cells with weekday headers
 */

import { DayCell } from "./DayCell";
import type { EconEvent } from "@/lib/econ";
import { isTodayUTC, isCurrentMonthUTC } from "@/lib/econDate";

interface CalendarGridProps {
  matrix: string[][]; // 6×7 array of ISO date strings (YYYY-MM-DD)
  eventsByDay: Map<string, EconEvent[]>;
  anchorDate: Date;
  focusedDate: string | null;
  onDayFocus: (dateISO: string) => void;
  onDayClick: (dateISO: string) => void;
}

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function CalendarGrid({
  matrix,
  eventsByDay,
  anchorDate,
  focusedDate,
  onDayFocus,
  onDayClick,
}: CalendarGridProps) {
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
          {week.map((dateISO) => {
            const dayEvents = eventsByDay.get(dateISO) || [];
            const isToday = isTodayUTC(dateISO);
            const isCurrentMonth = isCurrentMonthUTC(dateISO, anchorDate);
            const isFocused = focusedDate === dateISO;

            return (
              <DayCell
                key={dateISO}
                dateISO={dateISO}
                events={dayEvents}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
                isFocused={isFocused}
                onFocus={() => onDayFocus(dateISO)}
                onClick={() => onDayClick(dateISO)}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
