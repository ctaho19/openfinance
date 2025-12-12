export function SkeletonBlock({ className = "" }: { className?: string }) {
  return (
    <div
      className={`
        bg-theme-tertiary
        bg-gradient-to-r from-theme-tertiary via-theme-secondary to-theme-tertiary
        bg-[length:200%_100%]
        animate-[shimmer_1.5s_infinite]
        rounded-xl
        ${className}
      `}
    />
  );
}

export function SkeletonText({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={`h-4 ${className}`} />;
}

export function SkeletonCard({ className = "" }: { className?: string }) {
  return <SkeletonBlock className={`h-24 ${className}`} />;
}

export function AccountSummarySkeleton() {
  return (
    <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-5 lg:p-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-28" />
          <SkeletonBlock className="h-3 w-36" />
        </div>
        <SkeletonBlock className="h-10 w-40" />
        <div className="flex gap-6">
          <div className="space-y-1">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-5 w-16" />
          </div>
          <div className="space-y-1">
            <SkeletonBlock className="h-3 w-20" />
            <SkeletonBlock className="h-5 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-2">
      <div className="grid grid-cols-4 gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-2 p-3">
            <SkeletonBlock className="h-10 w-10" />
            <SkeletonBlock className="h-3 w-12" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatsRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid gap-4 ${count === 2 ? 'grid-cols-2' : `lg:grid-cols-${count}`}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-theme-elevated rounded-2xl shadow-theme border border-theme p-4 lg:p-5">
          <SkeletonBlock className="h-3 w-24 mb-2" />
          <SkeletonBlock className="h-7 w-20" />
        </div>
      ))}
    </div>
  );
}

export function TransactionListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="bg-theme-elevated rounded-2xl shadow-theme border border-theme overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-theme">
        <SkeletonBlock className="h-5 w-36" />
        <SkeletonBlock className="h-4 w-16" />
      </div>
      <div className="divide-y divide-theme">
        {[...Array(rows)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <SkeletonBlock className="h-10 w-10" />
              <div className="space-y-1.5">
                <SkeletonBlock className="h-4 w-28" />
                <SkeletonBlock className="h-3 w-16" />
              </div>
            </div>
            <SkeletonBlock className="h-5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MobileCardSkeleton() {
  return (
    <div className="bg-theme-elevated rounded-2xl shadow-theme p-4 border border-theme">
      <div className="flex items-center gap-4">
        <SkeletonBlock className="h-12 w-12" />
        <div className="flex-1 space-y-2">
          <SkeletonBlock className="h-3 w-20" />
          <SkeletonBlock className="h-6 w-32" />
        </div>
        <SkeletonBlock className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}
