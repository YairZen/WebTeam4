/**
 * ErrorState Component
 * --------------------
 * Consistent error display across the application.
 */

import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  message: string;
  details?: string;
  onRetry?: () => void;
  fullScreen?: boolean;
};

export function ErrorState({
  message,
  details,
  onRetry,
  fullScreen = false,
}: ErrorStateProps) {
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "py-6";

  return (
    <div className={containerClass}>
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium text-red-800">{message}</div>
            {details && (
              <div className="mt-1 text-sm text-red-700">{details}</div>
            )}
          </div>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-4 w-full rounded-xl bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 transition"
            type="button"
          >
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Inline error message for forms
 */
export function InlineError({ message }: { message: string }) {
  return (
    <div className="text-red-600 text-sm bg-red-50 py-2 px-3 rounded-lg flex items-center gap-2">
      <AlertTriangle className="w-4 h-4" />
      {message}
    </div>
  );
}
