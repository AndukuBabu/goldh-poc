/**
 * Economic Calendar Filters
 * Multi-select filters for Region, Category, Importance, and Date Range
 * Sticky on scroll, mobile collapsible
 */

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { X, ChevronDown, ChevronUp, Filter } from "lucide-react";
import { 
  ECON_COUNTRIES, 
  ECON_COUNTRY_LABELS, 
  ECON_CATEGORIES, 
  ECON_CATEGORY_LABELS,
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

  // Handle category filter toggle
  const toggleCategory = (category: string) => {
    const current = filters.category || [];
    const updated = current.includes(category)
      ? current.filter(c => c !== category)
      : [...current, category];
    
    onFiltersChange({ ...filters, category: updated.length > 0 ? updated : undefined });
  };

  // Handle importance filter
  const handleImportanceChange = (values: string[]) => {
    onFiltersChange({ 
      ...filters, 
      importance: values.length > 0 ? values as ('High' | 'Medium' | 'Low')[] : undefined 
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
      className="border-primary/20 sticky top-20 z-10 bg-card/95 backdrop-blur-sm"
      data-testid="econ-filters"
      role="search"
      aria-label="Economic event filters"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">Filter Events</CardTitle>
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
                className="text-sm h-8"
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
        <CardContent className="space-y-4">
          {/* Region Filter */}
          <div className="space-y-2">
            <label 
              className="text-sm font-medium text-foreground"
              id="filter-region-label"
            >
              Region / Country
            </label>
            <div 
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="filter-region-label"
            >
              {ECON_COUNTRIES.map((country) => (
                <Button
                  key={country}
                  variant={(filters.country || []).includes(country) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCountry(country)}
                  className="h-8"
                  data-testid={`filter-country-${country.toLowerCase()}`}
                  aria-label={`Filter by ${ECON_COUNTRY_LABELS[country]}`}
                  aria-pressed={(filters.country || []).includes(country)}
                >
                  {ECON_COUNTRY_LABELS[country]}
                </Button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <label 
              className="text-sm font-medium text-foreground"
              id="filter-category-label"
            >
              Category
            </label>
            <div 
              className="flex flex-wrap gap-2"
              role="group"
              aria-labelledby="filter-category-label"
            >
              {ECON_CATEGORIES.map((category) => (
                <Button
                  key={category}
                  variant={(filters.category || []).includes(category) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleCategory(category)}
                  className="h-8"
                  data-testid={`filter-category-${category.toLowerCase()}`}
                  aria-label={`Filter by ${ECON_CATEGORY_LABELS[category].label}`}
                  aria-pressed={(filters.category || []).includes(category)}
                  title={ECON_CATEGORY_LABELS[category].description}
                >
                  {ECON_CATEGORY_LABELS[category].label}
                </Button>
              ))}
            </div>
          </div>

          {/* Importance Filter */}
          <div className="space-y-2">
            <label 
              className="text-sm font-medium text-foreground"
              id="filter-importance-label"
            >
              Importance Level
            </label>
            <ToggleGroup
              type="multiple"
              value={filters.importance || []}
              onValueChange={handleImportanceChange}
              className="justify-start"
              aria-labelledby="filter-importance-label"
            >
              <ToggleGroupItem 
                value="High" 
                className="h-8"
                data-testid="filter-importance-high"
                aria-label="Filter by high importance"
              >
                High
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="Medium" 
                className="h-8"
                data-testid="filter-importance-medium"
                aria-label="Filter by medium importance"
              >
                Medium
              </ToggleGroupItem>
              <ToggleGroupItem 
                value="Low" 
                className="h-8"
                data-testid="filter-importance-low"
                aria-label="Filter by low importance"
              >
                Low
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label 
              className="text-sm font-medium text-foreground"
              id="filter-status-label"
            >
              Event Status
            </label>
            <Select
              value={filters.status || "all"}
              onValueChange={(value) => 
                onFiltersChange({ 
                  ...filters, 
                  status: value === "all" ? undefined : value as "upcoming" | "released"
                })
              }
            >
              <SelectTrigger 
                className="w-full md:w-48 h-8"
                data-testid="filter-status"
                aria-labelledby="filter-status-label"
              >
                <SelectValue placeholder="All Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="upcoming">Upcoming Only</SelectItem>
                <SelectItem value="released">Released Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Active Filters Summary */}
          {activeFilterCount > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount !== 1 ? 's' : ''} active
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
