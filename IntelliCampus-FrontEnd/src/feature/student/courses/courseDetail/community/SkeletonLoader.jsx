function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function CommunityPostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBar className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBar className="h-4 w-36" />
          <SkeletonBar className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBar className="h-4 w-3/4" />
        <SkeletonBar className="h-4 w-full" />
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
        <SkeletonBar className="h-8 w-16 rounded-full" />
        <SkeletonBar className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function CommunitySidebarSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SkeletonBar className="h-5 w-28" />
        <SkeletonBar className="h-4 w-4" />
      </div>
      <SkeletonBar className="h-24 w-full rounded-xl" />
      <div className="mt-4 flex items-center justify-between gap-3">
        <SkeletonBar className="h-3 w-12" />
        <SkeletonBar className="h-9 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function MyCommunitiesSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <aside className="space-y-6 xl:order-2 xl:sticky xl:top-20 xl:self-start">
        <CommunitySidebarSkeleton />
      </aside>
      <div className="space-y-4 xl:order-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <CommunityPostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
