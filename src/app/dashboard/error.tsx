"use client";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] px-4 text-center">
      <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-8 max-w-md w-full">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-danger-50 dark:bg-danger-600/20 flex items-center justify-center">
          <svg
            className="w-8 h-8 text-danger-600 dark:text-danger-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        
        <h2 className="text-xl font-semibold text-theme-primary mb-2">
          We couldn&apos;t load your dashboard
        </h2>
        <p className="text-theme-secondary mb-6">
          Something went wrong while loading your data. Please try again.
        </p>

        {process.env.NODE_ENV === "development" && error.message && (
          <div className="mb-6 p-3 bg-theme-tertiary rounded-xl text-left">
            <p className="text-xs font-mono text-danger-600 dark:text-danger-400 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="px-4 py-2.5 rounded-xl bg-accent-600 text-white font-medium hover:bg-accent-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-elevated"
          >
            Try again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2.5 rounded-xl bg-theme-tertiary text-theme-primary font-medium hover:bg-theme-tertiary/80 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-theme-elevated"
          >
            Reload page
          </button>
        </div>
      </div>
    </div>
  );
}
