/**
 * Economic Calendar Empty State
 * Shown when no events match current filters
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Filter } from "lucide-react";

interface EconEmptyStateProps {
  onClearFilters?: () => void;
}

export function EconEmptyState({ onClearFilters }: EconEmptyStateProps) {
  return (
    <Card 
      className="border-primary/20"
      data-testid="econ-empty-state"
      role="status"
      aria-label="No events found"
    >
      <CardContent className="py-16">
        <div className="text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-muted/20 border border-muted-foreground/20 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground/50" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h3 className="text-xl font-semibold text-foreground mb-2">
            No Events Found
          </h3>

          {/* Description */}
          <p className="text-muted-foreground mb-6">
            No economic events match your current filters. Try adjusting your date range, 
            region, or category filters to see more events.
          </p>

          {/* Actions */}
          {onClearFilters && (
            <Button
              variant="outline"
              onClick={onClearFilters}
              data-testid="button-clear-filters-empty"
              aria-label="Clear all filters"
            >
              <Filter className="w-4 h-4 mr-2" />
              Clear All Filters
            </Button>
          )}

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Tip:</strong> The calendar displays events from the next 14 days by default. 
              Expand your date range to see more events.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
