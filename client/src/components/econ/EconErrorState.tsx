/**
 * Economic Calendar Error State
 * Shown when data fetching fails
 */

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";

interface EconErrorStateProps {
  error?: Error | string;
  onRetry?: () => void;
}

export function EconErrorState({ error, onRetry }: EconErrorStateProps) {
  const errorMessage = typeof error === 'string' 
    ? error 
    : error?.message || 'An unexpected error occurred';

  return (
    <Card 
      className="border-destructive/50 bg-destructive/5"
      data-testid="econ-error-state"
      role="alert"
      aria-label="Error loading events"
    >
      <CardContent className="py-16">
        <div className="text-center max-w-md mx-auto">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-destructive" aria-hidden="true" />
          </div>

          {/* Heading */}
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Unable to Load Events
          </h3>

          {/* Error Message */}
          <p className="text-muted-foreground mb-2">
            We encountered an error while loading economic calendar events.
          </p>
          <p className="text-sm text-destructive/90 mb-6 font-mono bg-destructive/10 px-4 py-2 rounded border border-destructive/20">
            {errorMessage}
          </p>

          {/* Actions */}
          {onRetry && (
            <Button
              variant="outline"
              onClick={onRetry}
              data-testid="button-retry-load"
              aria-label="Retry loading events"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Troubleshooting:</strong> Check your internet connection and try again. 
              If the problem persists, please contact support.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
