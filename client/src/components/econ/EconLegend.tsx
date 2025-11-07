/**
 * Economic Calendar Legend
 * Explains chips, badges, and visual indicators with icon shapes
 * Ensures accessibility by using shapes, not just colors
 * Enhanced with Grid View semantics and interaction explanations
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, AlertCircle, CheckCircle, Clock, AlertTriangle, Circle, Globe, MousePointer, ExternalLink } from "lucide-react";

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
        {/* Importance Levels - Shape-based, not color-only */}
        <div>
          <p className="font-semibold text-foreground mb-2">
            Importance Levels
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" aria-hidden="true" />
              <Badge variant="destructive" className="h-6">
                <AlertTriangle className="w-3 h-3 mr-1" aria-hidden="true" />
                High
              </Badge>
              <span className="text-muted-foreground text-xs">
                Filled triangle - Major market mover
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
          </div>
        </div>

        {/* Impact Scores */}
        <div>
          <p className="font-semibold text-foreground mb-2">
            AI Impact Score (0-100)
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400 flex-shrink-0" aria-hidden="true" />
              <Badge className="bg-red-900/50 text-red-300 border-red-800 h-6">
                80-100
              </Badge>
              <span className="text-muted-foreground text-xs">
                Critical impact expected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400 flex-shrink-0" aria-hidden="true" />
              <Badge className="bg-orange-900/50 text-orange-300 border-orange-800 h-6">
                60-79
              </Badge>
              <span className="text-muted-foreground text-xs">
                High volatility likely
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400 flex-shrink-0" aria-hidden="true" />
              <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-800 h-6">
                40-59
              </Badge>
              <span className="text-muted-foreground text-xs">
                Moderate movement
              </span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400 flex-shrink-0" aria-hidden="true" />
              <Badge className="bg-blue-900/50 text-blue-300 border-blue-800 h-6">
                20-39
              </Badge>
              <span className="text-muted-foreground text-xs">
                Low impact
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <Badge variant="secondary" className="h-6">
                0-19
              </Badge>
              <span className="text-muted-foreground text-xs">
                Minimal effect
              </span>
            </div>
          </div>
        </div>

        {/* Confidence Levels */}
        <div>
          <p className="font-semibold text-foreground mb-2">
            AI Confidence
          </p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" aria-hidden="true" />
              <span className="text-xs text-foreground">
                <span className="text-primary font-medium">85-100%</span>
                <span className="text-muted-foreground"> - High certainty</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary/60 flex-shrink-0" aria-hidden="true" />
              <span className="text-xs text-foreground">
                <span className="text-primary/80 font-medium">70-84%</span>
                <span className="text-muted-foreground"> - Good confidence</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
              <span className="text-xs text-foreground">
                <span className="text-muted-foreground font-medium">50-69%</span>
                <span className="text-muted-foreground"> - Moderate uncertainty</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" aria-hidden="true" />
              <span className="text-xs text-foreground">
                <span className="text-destructive font-medium">&lt;50%</span>
                <span className="text-muted-foreground"> - Low confidence</span>
              </span>
            </div>
          </div>
        </div>

        {/* Event Status */}
        <div>
          <p className="font-semibold text-foreground mb-2">
            Event Status
          </p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" aria-hidden="true" />
              <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-800 h-6">
                <Clock className="w-3 h-3 mr-1" aria-hidden="true" />
                Upcoming
              </Badge>
              <span className="text-muted-foreground text-xs">
                Not yet released
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" aria-hidden="true" />
              <Badge variant="outline" className="bg-green-900/20 text-green-300 border-green-800 h-6">
                <CheckCircle className="w-3 h-3 mr-1" aria-hidden="true" />
                Released
              </Badge>
              <span className="text-muted-foreground text-xs">
                Data published
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
