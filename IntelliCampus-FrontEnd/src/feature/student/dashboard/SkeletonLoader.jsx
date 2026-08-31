function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-5 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark">
      <SkeletonBar className="w-14 h-14 rounded-2xl shrink-0" />
      <div className="flex flex-col gap-2 grow">
        <SkeletonBar className="h-3 w-24" />
        <SkeletonBar className="h-8 w-20" />
      </div>
    </div>
  );
}

export function NewsItemSkeleton() {
  return (
    <div className="p-4 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark space-y-2">
      <SkeletonBar className="h-4 w-3/4" />
      <SkeletonBar className="h-3 w-1/2" />
      <SkeletonBar className="h-3 w-1/3" />
    </div>
  );
}

export function NewsSectionSkeleton() {
  return (
    <div className="lg:col-span-8 p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <SkeletonBar className="h-7 w-40" />
        <SkeletonBar className="w-6 h-6 rounded" />
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <NewsItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function SidebarSectionSkeleton() {
  return (
    <div className="lg:col-span-4 flex flex-col gap-6">
      <div className="p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBar className="h-7 w-48" />
          <SkeletonBar className="w-6 h-6 rounded" />
        </div>
        <div className="flex flex-col gap-3 mb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <SkeletonBar className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <SkeletonBar className="h-3 w-2/3" />
                <SkeletonBar className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
        <SkeletonBar className="h-4 w-36 mx-auto" />
      </div>
      <div className="p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBar className="h-7 w-32" />
        </div>
        <SkeletonBar className="w-48 h-48 mx-auto mb-4 rounded-xl" />
        <div className="flex items-center justify-center gap-3 pt-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
          <SkeletonBar className="h-10 w-24 rounded-lg" />
          <SkeletonBar className="h-10 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
      <SkeletonBar className="h-5 w-48 mb-4" />
      <SkeletonBar className="h-[220px] w-full rounded" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-4">
        <NewsSectionSkeleton />
        <SidebarSectionSkeleton />
      </div>

      <div className="mb-4">
        <div className="flex items-center gap-3 mb-6">
          <SkeletonBar className="w-7 h-7 rounded" />
          <SkeletonBar className="h-7 w-24" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6">
            <ChartSkeleton />
          </div>
          <div className="lg:col-span-6">
            <ChartSkeleton />
          </div>
        </div>
      </div>
    </>
  );
}
