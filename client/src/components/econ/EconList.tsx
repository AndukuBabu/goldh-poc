/**
 * Economic Calendar Event List
 * Paginated list of events sorted by datetime_utc (ascending)
 */

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { EconRow } from "./EconRow";
import { EconEmptyState } from "./EconEmptyState";
import type { EconEvent } from "@shared/schema";

interface EconListProps {
  events: EconEvent[];
  isLoading?: boolean;
  pageSize?: number;
}

export function EconList({ events, isLoading = false, pageSize = 20 }: EconListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // Sort events by datetime_utc ascending (earliest first)
  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => 
      new Date(a.datetime_utc).getTime() - new Date(b.datetime_utc).getTime()
    );
  }, [events]);

  // Pagination logic
  const totalPages = Math.ceil(sortedEvents.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedEvents = sortedEvents.slice(startIndex, endIndex);

  // Reset to page 1 when events change
  useMemo(() => {
    setCurrentPage(1);
  }, [events.length]);

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Economic Events</CardTitle>
          <CardDescription>Loading events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className="h-24 bg-muted/20 rounded-lg animate-pulse"
                aria-label="Loading event"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (sortedEvents.length === 0) {
    return <EconEmptyState />;
  }

  return (
    <Card 
      className="border-primary/20"
      data-testid="econ-list"
      role="region"
      aria-label="Economic events list"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Economic Events</CardTitle>
            <CardDescription>
              Showing {startIndex + 1}-{Math.min(endIndex, sortedEvents.length)} of {sortedEvents.length} events
            </CardDescription>
          </div>
          {totalPages > 1 && (
            <div 
              className="flex items-center gap-2"
              role="navigation"
              aria-label="Event list pagination"
            >
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                data-testid="button-prev-page"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                data-testid="button-next-page"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="space-y-3"
          data-testid="econ-list-items"
        >
          {paginatedEvents.map((event) => (
            <EconRow key={event.id} event={event} />
          ))}
        </div>

        {/* Bottom Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              data-testid="button-prev-page-bottom"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              data-testid="button-next-page-bottom"
              aria-label="Next page"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
