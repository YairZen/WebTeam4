/**
 * LoadingState Component
 * ----------------------
 * Consistent loading states across the application.
 */

type LoadingStateProps = {
  message?: string;
  fullScreen?: boolean;
};

export function LoadingState({
  message = "Loading...",
  fullScreen = false,
}: LoadingStateProps) {
  const containerClass = fullScreen
    ? "min-h-screen flex items-center justify-center"
    : "flex items-center justify-center py-10";

  return (
    <div className={containerClass}>
      <div className="text-gray-600 flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
        {message}
      </div>
    </div>
  );
}

/**
 * Skeleton loader for cards
 */
export function CardSkeleton({ count = 1 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border bg-white p-6 shadow-sm animate-pulse"
        >
          <div className="h-5 w-56 rounded bg-gray-100" />
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="h-20 rounded-xl bg-gray-100" />
            <div className="h-20 rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );
}
