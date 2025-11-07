/**
 * Economic Calendar Grid - Month Header
 * Navigation controls for month selection (Prev, Today, Next)
 * Displays current month/year with optional month picker
 */

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { getMonthYearUTC, getPreviousMonthUTC, getNextMonthUTC } from "@/lib/econDate";

interface MonthHeaderProps {
  anchorDate: Date;
  onNavigate: (newDate: Date) => void;
}

export function MonthHeader({ anchorDate, onNavigate }: MonthHeaderProps) {
  const { month, year } = getMonthYearUTC(anchorDate);

  const handlePrevMonth = () => {
    onNavigate(getPreviousMonthUTC(anchorDate));
  };

  const handleNextMonth = () => {
    onNavigate(getNextMonthUTC(anchorDate));
  };

  const handleToday = () => {
    onNavigate(new Date());
  };

  return (
    <div 
      className="flex items-center justify-between p-4 border-b border-border bg-card/50"
      data-testid="grid-month-header"
    >
      {/* Month/Year Display */}
      <div className="flex items-center gap-2">
        <Calendar className="w-5 h-5 text-primary" aria-hidden="true" />
        <h2 
          className="text-xl font-semibold text-foreground"
          data-testid="grid-month-title"
        >
          {month} {year}
        </h2>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevMonth}
          className="h-9"
          data-testid="button-prev-month"
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          <span className="hidden sm:inline">Prev</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleToday}
          className="h-9"
          data-testid="button-today"
          aria-label="Jump to current month"
        >
          Today
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextMonth}
          className="h-9"
          data-testid="button-next-month"
          aria-label="Next month"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
