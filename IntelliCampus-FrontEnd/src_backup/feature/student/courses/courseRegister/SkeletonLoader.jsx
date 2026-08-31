function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="relative flex flex-col gap-3 p-4 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
      {/* Top row: avatar + course info + credits */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <SkeletonBar className="w-10 h-10 rounded-full shrink-0" />
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex gap-2">
              <SkeletonBar className="h-4 w-16 rounded" />
              <SkeletonBar className="h-4 w-4 rounded-full" />
            </div>
            <SkeletonBar className="h-5 w-40 rounded" />
          </div>
        </div>
        <SkeletonBar className="h-4 w-8 rounded shrink-0" />
      </div>

      {/* Middle info: professor, schedule, room */}
      <div className="flex flex-col gap-1 ps-[52px]">
        <SkeletonBar className="h-4 w-3/4 rounded" />
        <SkeletonBar className="h-4 w-1/2 rounded" />
        <SkeletonBar className="h-4 w-1/3 rounded" />
      </div>

      {/* Bottom row: dropdown + action button */}
      <div className="pt-3 flex items-center gap-3 border-t border-t-border-primary-default-light dark:border-t-border-primary-default-dark">
        <SkeletonBar className="h-9 flex-1 rounded-lg" />
        <SkeletonBar className="h-8 w-8 rounded-md shrink-0" />
      </div>
    </div>
  );
}

export function RegistrationPageSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/50 dark:bg-bg-surface-secondary-default-dark/50">
            <SkeletonBar className="h-4 w-32 rounded" />
            <SkeletonBar className="h-3 w-6 rounded" />
          </div>
          <div className="flex-1 p-4 space-y-4 min-h-[420px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/30 dark:bg-bg-surface-secondary-default-dark/30">
            <SkeletonBar className="h-10 w-48 rounded-lg mx-auto" />
          </div>
        </div>
        <div className="flex flex-col rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/50 dark:bg-bg-surface-secondary-default-dark/50">
            <SkeletonBar className="h-4 w-32 rounded" />
            <SkeletonBar className="h-3 w-6 rounded" />
          </div>
          <div className="flex-1 p-4 space-y-4 min-h-[420px]">
            {Array.from({ length: 2 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
          <div className="px-4 py-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/30 dark:bg-bg-surface-secondary-default-dark/30">
            <SkeletonBar className="h-10 w-48 rounded-lg mx-auto" />
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <SkeletonBar className="h-4 w-40 rounded" />
          <SkeletonBar className="h-4 w-4 rounded" />
        </div>
      </div>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-t-2 border-border-primary-default-light dark:border-border-primary-default-dark pt-6">
        <div className="flex gap-3">
          <SkeletonBar className="h-10 w-32 rounded-lg" />
          <SkeletonBar className="h-10 w-40 rounded-lg" />
        </div>
        <SkeletonBar className="h-16 w-full md:w-80 rounded-lg" />
      </div>
    </div>
  );
}
