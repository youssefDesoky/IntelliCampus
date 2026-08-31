function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function AssignmentStatsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
          <SkeletonBar className="h-4 w-20" />
          <SkeletonBar className="h-6 w-10" />
        </div>
      ))}
    </div>
  );
}

export function AssignmentCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 space-y-2">
          <SkeletonBar className="h-5 w-3/4" />
          <SkeletonBar className="h-4 w-full" />
        </div>
        <SkeletonBar className="h-6 w-20 rounded-full shrink-0" />
      </div>
      <div className="flex flex-wrap items-center gap-4 sm:gap-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <SkeletonBar className="w-8 h-8 rounded-full" />
            <div className="space-y-1">
              <SkeletonBar className="h-3 w-12" />
              <SkeletonBar className="h-4 w-16" />
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-4 pt-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
        <SkeletonBar className="h-9 flex-1 rounded-lg" />
        <SkeletonBar className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function CourseAssignmentsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-5">
            <SkeletonBar className="h-6 w-48" />
            <SkeletonBar className="h-6 w-24 rounded-full" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <AssignmentCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <SkeletonBar className="h-6 w-36 mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <AssignmentCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:block">
        <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
          <SkeletonBar className="h-5 w-32 mb-4" />
          <AssignmentStatsSkeleton />
        </div>
      </div>
    </div>
  );
}
