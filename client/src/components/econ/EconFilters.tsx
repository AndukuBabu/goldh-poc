/**
 * Economic Calendar Filters
 * Multi-select filters for Region, Category, Importance, and Status
 * Sticky on scroll, mobile collapsible, fully accessible
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { X, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { 
  ECON_COUNTRIES, 
  ECON_COUNTRY_LABELS,
  type EconEventFilters 
} from "@/lib/econ";

interface EconFiltersProps {
  filters: EconEventFilters;
  onFiltersChange: (filters: EconEventFilters) => void;
  activeFilterCount?: number;
}

export function EconFilters({ filters, onFiltersChange, activeFilterCount = 0 }: EconFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Handle country filter toggle
  const toggleCountry = (country: string) => {
    const current = filters.country || [];
    const updated = current.includes(country)
      ? current.filter(c => c !== country)
      : [...current, country];
    
    onFiltersChange({ ...filters, country: updated.length > 0 ? updated : undefined });
  };

  // Handle impact filter
  const handleImpactChange = (values: string[]) => {
    onFiltersChange({ 
      ...filters, 
      impact: values.length > 0 ? values as ('High' | 'Medium' | 'Low' | 'Holiday')[] : undefined 
    });
  };

  // Clear all filters
  const clearAllFilters = () => {
    onFiltersChange({
      from: filters.from,  // Keep date range
      to: filters.to,
    });
  };

  return (
    <Card 
      className="border-primary/20 bg-card/95 backdrop-blur-sm"
      data-testid="econ-filters"
      role="search"
      aria-label="Economic event filters"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg text-foreground">Filter Events</CardTitle>
            {activeFilterCount > 0 && (
              <Badge 
                variant="default" 
                className="ml-2"
                data-testid="filter-count-badge"
                aria-label={`${activeFilterCount} active filters`}
              >
                {activeFilterCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-sm h-8 text-foreground"
                data-testid="button-clear-filters"
                aria-label="Clear all filters"
              >
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="md:hidden h-8 w-8 p-0"
              data-testid="button-toggle-filters"
              aria-label={isExpanded ? "Collapse filters" : "Expand filters"}
              aria-expanded={isExpanded}
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4 max-h-[60vh] md:max-h-none overflow-y-auto md:overflow-y-visible border-b border-[#2a2a2a] pb-4">
          {/* Region Filter */}
          <div className="space-y-2">
            <label 
              className="text-sm font-medium text-foreground"
              id="filter-region-label"
            >
              Region / Country
            </label>
            <div 
              className="flex gap-2 overflow-x-auto snap-x snap-mandatory pb-2 scrollbar-hide"
              role="group"
              aria-labelledby="filter-region-label"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
              }}
            >
              {ECON_COUNTRIES.map((country) => {
                const isActive = (filters.country || []).includes(country);
                return (
                  <Button
                    key={country}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleCountry(country)}
                    className="h-8 snap-start flex-shrink-0"
                    data-testid={`filter-country-${country.toLowerCase()}`}
                    aria-label={`Filter by ${ECON_COUNTRY_LABELS[country]}`}
                    aria-pressed={isActive}
                    tabIndex={0}
                  >
                    {ECON_COUNTRY_LABELS[country]}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Impact Filter */}
          <div className="space-y-2">
            <label 
              className="text-sm font-medium text-foreground"
              id="filter-impact-label"
            >
              Impact Level
            </label>
            <ToggleGroup
              type="multiple"
              value={filters.impact || []}
              onValueChange={handleImpactChange}
              className="justify-start flex-wrap gap-2"
              aria-labelledby="filter-impact-label"
            >
              <ToggleGroupItem 
                value="High" 
                className="h-8"
                data-testid="filter-impact-high"
                aria-label="Filter by high impact events"
                tabIndex={0}
              >
                High
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="Medium" 
                className="h-8"
                data-testid="filter-impact-medium"
                aria-label="Filter by medium impact events"
                tabIndex={0}
              >
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="Low" 
                className="h-8"
                data-testid="filter-impact-low"
                aria-label="Filter by low impact events"
                tabIndex={0}
              >
                Low
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="Holiday" 
                className="h-8"
                data-testid="filter-impact-holiday"
                aria-label="Filter by holidays"
                tabIndex={0}
              >
                Holiday
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-foreground/70">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
