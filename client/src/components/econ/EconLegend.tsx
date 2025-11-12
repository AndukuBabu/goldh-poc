/**
 * Economic Calendar Legend
 * Explains chips, badges, and visual indicators with icon shapes
 * Ensures accessibility by using shapes, not just colors
 * Enhanced with Grid View semantics and interaction explanations
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, AlertTriangle, Circle, Globe, MousePointer, ExternalLink, Calendar } from "lucide-react";

export function EconLegend() {
  return (
    <Card 
      className="border-primary/20 bg-card"
      data-testid="econ-legend"
      role="region"
      aria-label="Calendar legend and explanation of visual indicators"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg">Legend</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Impact Levels - Shape-based, not color-only */}
        <div>
          <p className="font-semibold text-foreground mb-2">
            Impact Levels
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" aria-hidden="true" />
              <Badge variant="destructive" className="h-6">
                <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
                High
              </Badge>
              <span className="text-muted-foreground text-xs">
                Triangle - Major market mover
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
              <Badge variant="default" className="h-6">
                <Info className="w-3 h-3 mr-1" aria-hidden="true" />
                Medium
              </Badge>
              <span className="text-muted-foreground text-xs">
                Info icon - Moderate impact
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <Badge variant="secondary" className="h-6">
                <Circle className="w-3 h-3 mr-1" aria-hidden="true" />
                Low
              </Badge>
              <span className="text-muted-foreground text-xs">
                Circle - Minor influence
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <Badge variant="outline" className="h-6">
                <Calendar className="w-3 h-3 mr-1" aria-hidden="true" />
                Holiday
              </Badge>
              <span className="text-muted-foreground text-xs">
                Calendar - Bank holidays and market closures
              </span>
            </div>
          </div>
        </div>

        {/* Grid View Semantics */}
        <div className="pt-2 border-t border-border">
          <p className="font-semibold text-foreground mb-2">
            Grid View Interactions
          </p>
          <div className="space-y-2.5">
            {/* Event Dots */}
            <div className="flex items-start gap-2">
              <div className="flex gap-1 mt-1 flex-shrink-0">
                <AlertTriangle className="w-3 h-3 text-red-500" aria-hidden="true" />
                <Info className="w-3 h-3 text-orange-500" aria-hidden="true" />
                <Circle className="w-3 h-3 text-yellow-500" aria-hidden="true" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-foreground font-medium">Event Dots</p>
                <p className="text-xs text-muted-foreground">
                  Each day shows up to 3 events by importance. Triangle = High, Info icon = Medium, Circle = Low.
                </p>
              </div>
            </div>

            {/* +N more indicator */}
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex-shrink-0">
                <span className="text-xs text-primary font-medium">
                  +3 more
                </span>
              </div>
              <div className="flex-1">
                <p className="text-xs text-foreground font-medium">Overflow Indicator</p>
                <p className="text-xs text-muted-foreground">
                  Days with 4+ events show "+N more". Click/tap the day to view all events.
                </p>
              </div>
            </div>

            {/* Hover/Tap Preview */}
            <div className="flex items-start gap-2">
              <MousePointer className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs text-foreground font-medium">Quick Preview (Desktop)</p>
                <p className="text-xs text-muted-foreground">
                  Hover over a day to see event details in a popover. Click to open full drawer.
                </p>
              </div>
            </div>

            {/* Drill-down */}
            <div className="flex items-start gap-2">
              <ExternalLink className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs text-foreground font-medium">View in List</p>
                <p className="text-xs text-muted-foreground">
                  From drawer/popover, click "View day in List" to see events with full details and filters.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Time Zone & Accessibility Notes */}
        <div className="pt-2 border-t border-border">
          <div className="space-y-2">
            {/* UTC Time Note */}
            <div className="flex items-start gap-2">
              <Globe className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs text-foreground">
                  <span className="font-medium text-primary">Times shown in UTC.</span>
                  <span className="text-muted-foreground"> Hover or tap any time to see your local time conversion.</span>
                </p>
              </div>
            </div>

            {/* Accessibility Note */}
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs text-muted-foreground">
                  Icons and shapes ensure accessibility for colorblind users. All elements are keyboard navigable.
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
