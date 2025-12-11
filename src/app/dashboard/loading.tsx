import {
  SkeletonBlock,
  AccountSummarySkeleton,
  QuickActionsSkeleton,
  StatsRowSkeleton,
  TransactionListSkeleton,
  MobileCardSkeleton,
} from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Welcome Header - Mobile Only */}
      <header className="lg:hidden">
        <SkeletonBlock className="h-4 w-40" />
      </header>

      {/* Desktop Welcome */}
      <header className="hidden lg:block space-y-2">
        <SkeletonBlock className="h-8 w-72" />
        <SkeletonBlock className="h-4 w-80" />
      </header>

      {/* Hero Account Summary Card Skeleton */}
      <AccountSummarySkeleton />

      {/* Alert Strip Placeholder */}
      <SkeletonBlock className="h-16 rounded-2xl" />

      {/* Quick Actions Grid Skeleton */}
      <QuickActionsSkeleton />

      {/* Stats Grid - Desktop */}
      <div className="hidden lg:block">
        <StatsRowSkeleton count={4} />
      </div>

      {/* Mobile Stats Row */}
      <div className="lg:hidden">
        <StatsRowSkeleton count={2} />
      </div>

      {/* Upcoming Payments List Skeleton */}
      <TransactionListSkeleton rows={3} />

      {/* Mobile: FOO Progress Card */}
      <div className="lg:hidden">
        <MobileCardSkeleton />
      </div>

      {/* Mobile: Total Debt Card */}
      <div className="lg:hidden">
        <MobileCardSkeleton />
      </div>
    </div>
  );
}
