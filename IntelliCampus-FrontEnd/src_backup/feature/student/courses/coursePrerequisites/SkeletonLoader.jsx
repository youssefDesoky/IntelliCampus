function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function PrereqCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
      <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5">
        <div className="flex-1 space-y-3">
          <SkeletonBar className="h-7 w-24" />
          <SkeletonBar className="h-4 w-3/4" />
        </div>
        <SkeletonBar className="w-14 h-14 shrink-0 rounded-full" />
      </div>
      <div className="border-t border-dashed border-border-primary-default-light/70 dark:border-border-primary-default-dark/70" />
      <div className="px-6 py-5 space-y-3">
        <SkeletonBar className="h-3 w-24" />
        <div className="flex flex-wrap items-center gap-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonBar key={i} className="h-10 w-24 rounded-lg" />
          ))}
          <SkeletonBar className="h-10 w-28 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function PrereqPageSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <PrereqCardSkeleton key={i} />
      ))}
    </div>
  );
}
