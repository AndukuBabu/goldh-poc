/**
 * UMF Alert Card Component
 * 
 * Displays a single market alert banner styled by severity:
 * - info: Blue/neutral styling
 * - warn: Yellow/orange styling
 * - high: Red/critical styling
 * 
 * Shows: title, body, timestamp, dismissible close button
 * 
 * @see client/src/hooks/useUmf.ts - useUmfAlerts() hook
 */

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import type { UmfAlert } from "@shared/schema";

interface UmfAlertCardProps {
  alert: UmfAlert;
  onDismiss?: (alertId: string) => void;
  className?: string;
}

/**
 * Alert severity configuration
 * Maps severity levels to colors, icons, and labels
 */
const SEVERITY_CONFIG = {
  info: {
    icon: Info,
    label: 'Information',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    textColor: 'text-blue-500',
    iconBgColor: 'bg-blue-500/20',
  },
  warn: {
    icon: AlertTriangle,
    label: 'Warning',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/30',
    textColor: 'text-yellow-500',
    iconBgColor: 'bg-yellow-500/20',
  },
  high: {
    icon: AlertCircle,
    label: 'Critical',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
    textColor: 'text-red-500',
    iconBgColor: 'bg-red-500/20',
  },
} as const;

export function UmfAlertCard({ alert, onDismiss, className }: UmfAlertCardProps) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  // Format timestamp for display
  const alertTime = new Date(alert.createdAt_utc).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card
      className={`${config.bgColor} border ${config.borderColor} shadow-md ${className || ''}`}
      role="alert"
      aria-live="polite"
      aria-labelledby={`alert-title-${alert.id}`}
      aria-describedby={`alert-body-${alert.id}`}
      data-testid={`umf-alert-${alert.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Severity Icon */}
          <div 
            className={`w-10 h-10 rounded-full ${config.iconBgColor} flex items-center justify-center flex-shrink-0`}
            aria-hidden="true"
          >
            <Icon className={`w-5 h-5 ${config.textColor}`} />
          </div>

          {/* Alert Content */}
          <div className="flex-1 min-w-0">
            {/* Header: Title + Severity Badge */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3
                  id={`alert-title-${alert.id}`}
                  className="text-sm font-semibold text-foreground"
                  data-testid={`alert-title-${alert.id}`}
                >
                  {alert.title}
                </h3>
                <Badge
                  variant="outline"
                  className={`text-xs ${config.bgColor} ${config.borderColor} ${config.textColor}`}
                  data-testid={`alert-severity-${alert.id}`}
                >
                  {config.label}
                </Badge>
              </div>

              {/* Dismiss Button */}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 hover:bg-background/20"
                  onClick={() => onDismiss(alert.id)}
                  aria-label={`Dismiss ${config.label.toLowerCase()} alert`}
                  data-testid={`alert-dismiss-${alert.id}`}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>

            {/* Body Text */}
            <p
              id={`alert-body-${alert.id}`}
              className="text-sm text-muted-foreground mb-2"
              data-testid={`alert-body-${alert.id}`}
            >
              {alert.body}
            </p>

            {/* Timestamp */}
            <div 
              className="text-xs text-muted-foreground flex items-center gap-1"
              data-testid={`alert-time-${alert.id}`}
            >
              <span className={`w-1 h-1 rounded-full ${config.bgColor}`} aria-hidden="true" />
              <time dateTime={alert.createdAt_utc}>
                {alertTime}
              </time>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Alert List Component
 * Displays multiple alerts in a stacked layout
 */
interface UmfAlertListProps {
  alerts: UmfAlert[];
  onDismiss?: (alertId: string) => void;
  className?: string;
}

export function UmfAlertList({ alerts, onDismiss, className }: UmfAlertListProps) {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <div 
      className={`space-y-3 ${className || ''}`}
      role="region"
      aria-label="Market alerts"
      data-testid="umf-alert-list"
    >
      {alerts.map((alert) => (
        <UmfAlertCard
          key={alert.id}
          alert={alert}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}
