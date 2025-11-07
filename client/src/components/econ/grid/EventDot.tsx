/**
 * Economic Calendar Grid - Event Dot/Chip
 * Compact event indicator with importance-based styling
 */

import { cn } from "@/lib/utils";
import { AlertTriangle, Info, Circle } from "lucide-react";
import type { EconEvent } from "@/lib/econ";

interface EventDotProps {
  event: EconEvent;
  variant?: 'dot' | 'chip'; // dot = colored circle, chip = small badge
}

export function EventDot({ event, variant = 'chip' }: EventDotProps) {
  // Icon and color by importance
  const importanceConfig: Record<string, {
    icon: React.ComponentType<any>;
    colorClass: string;
    dotClass: string;
  }> = {
    High: {
      icon: AlertTriangle,
      colorClass: 'text-red-500 bg-red-500/10 border-red-500/20',
      dotClass: 'bg-red-500',
    },
    Medium: {
      icon: Info,
      colorClass: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
      dotClass: 'bg-orange-500',
    },
    Low: {
      icon: Circle,
      colorClass: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      dotClass: 'bg-yellow-500',
    },
  };

  const config = importanceConfig[event.importance];
  const Icon = config.icon;

  // Truncate title for display (max 20 chars)
  const truncatedTitle = event.title.length > 20 
    ? `${event.title.substring(0, 20)}...` 
    : event.title;

  if (variant === 'dot') {
    // Simple colored dot (mobile view)
    return (
      <div className="flex items-center gap-1">
        <div 
          className={cn("w-2 h-2 rounded-full", config.dotClass)}
          aria-hidden="true"
        />
        <span className="sr-only">
          {event.importance} importance event: {event.title}
        </span>
      </div>
    );
  }

  // Chip with icon and text (desktop view)
  return (
    <div
      className={cn(
        "flex items-center gap-1 px-2 py-0.5 rounded text-xs border",
        "truncate max-w-full",
        config.colorClass
      )}
      title={event.title}
    >
      <Icon className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
      <span className="truncate hidden sm:inline">{truncatedTitle}</span>
      <span className="sr-only">
        {event.importance} importance event: {event.title}
      </span>
    </div>
  );
}
