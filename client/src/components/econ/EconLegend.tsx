/**
 * Economic Calendar Legend
 * Explains chips, badges, and visual indicators
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info, TrendingUp, TrendingDown, AlertCircle, CheckCircle, Clock } from "lucide-react";

export function EconLegend() {
  return (
    <Card 
      className="border-primary/20"
      data-testid="econ-legend"
      role="region"
      aria-label="Calendar legend and explanation"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" aria-hidden="true" />
          <CardTitle className="text-lg">Legend</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {/* Importance Levels */}
        <div>
          <p className="font-semibold text-foreground mb-2">Importance Levels</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" aria-hidden="true" />
              <Badge variant="destructive" className="h-6">High</Badge>
              <span className="text-muted-foreground text-xs">Major market mover</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-primary" aria-hidden="true" />
              <Badge variant="default" className="h-6">Medium</Badge>
              <span className="text-muted-foreground text-xs">Moderate impact</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Badge variant="secondary" className="h-6">Low</Badge>
              <span className="text-muted-foreground text-xs">Minor influence</span>
            </div>
          </div>
        </div>

        {/* Impact Scores */}
        <div>
          <p className="font-semibold text-foreground mb-2">AI Impact Score (0-100)</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-red-400" aria-hidden="true" />
              <Badge className="bg-red-900/50 text-red-300 border-red-800 h-6">80-100</Badge>
              <span className="text-muted-foreground text-xs">Critical impact expected</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-400" aria-hidden="true" />
              <Badge className="bg-orange-900/50 text-orange-300 border-orange-800 h-6">60-79</Badge>
              <span className="text-muted-foreground text-xs">High volatility likely</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-yellow-400" aria-hidden="true" />
              <Badge className="bg-yellow-900/50 text-yellow-300 border-yellow-800 h-6">40-59</Badge>
              <span className="text-muted-foreground text-xs">Moderate movement</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <Badge className="bg-blue-900/50 text-blue-300 border-blue-800 h-6">20-39</Badge>
              <span className="text-muted-foreground text-xs">Low impact</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Badge variant="secondary" className="h-6">0-19</Badge>
              <span className="text-muted-foreground text-xs">Minimal effect</span>
            </div>
          </div>
        </div>

        {/* Confidence Levels */}
        <div>
          <p className="font-semibold text-foreground mb-2">AI Confidence</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" aria-hidden="true" />
              <span className="text-xs">
                <span className="text-primary font-medium">85-100%</span>
                <span className="text-muted-foreground"> - High certainty</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary/60" aria-hidden="true" />
              <span className="text-xs">
                <span className="text-primary/80 font-medium">70-84%</span>
                <span className="text-muted-foreground"> - Good confidence</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <span className="text-xs">
                <span className="text-muted-foreground font-medium">50-69%</span>
                <span className="text-muted-foreground"> - Moderate uncertainty</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" aria-hidden="true" />
              <span className="text-xs">
                <span className="text-destructive font-medium">&lt;50%</span>
                <span className="text-muted-foreground"> - Low confidence</span>
              </span>
            </div>
          </div>
        </div>

        {/* Event Status */}
        <div>
          <p className="font-semibold text-foreground mb-2">Event Status</p>
          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-400" aria-hidden="true" />
              <Badge variant="outline" className="bg-blue-900/20 text-blue-300 border-blue-800 h-6">
                Upcoming
              </Badge>
              <span className="text-muted-foreground text-xs">Not yet released</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" aria-hidden="true" />
              <Badge variant="outline" className="bg-green-900/20 text-green-300 border-green-800 h-6">
                Released
              </Badge>
              <span className="text-muted-foreground text-xs">Data published</span>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground italic">
            💡 Hover over any event for detailed information and local time conversion
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
