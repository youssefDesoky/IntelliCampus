function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function CurrentGradeSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-6">
      <SkeletonBar className="h-5 w-28 mb-4" />
      <div className="flex items-end gap-4 mb-4">
        <SkeletonBar className="h-16 w-20 rounded-lg" />
        <SkeletonBar className="h-10 w-16 rounded-lg" />
      </div>
      <SkeletonBar className="h-2 w-full rounded-full" />
      <div className="flex items-center justify-between mt-2">
        <SkeletonBar className="h-3 w-20" />
        <SkeletonBar className="h-3 w-24" />
      </div>
    </div>
  );
}

export function AssessmentBreakdownSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-6">
      <SkeletonBar className="h-5 w-44 mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <SkeletonBar className="h-4 w-32" />
              <SkeletonBar className="h-4 w-16" />
            </div>
            <SkeletonBar className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function GradeHistorySkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-6">
      <SkeletonBar className="h-5 w-32 mb-5" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-4 flex-1" />
            <SkeletonBar className="h-4 w-12" />
            <SkeletonBar className="h-6 w-16 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseGradeSkeleton() {
  return (
    <div className="relative overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AssessmentBreakdownSkeleton />
        </div>
        <div className="flex flex-col gap-6">
          <CurrentGradeSkeleton />
          <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-6">
            <SkeletonBar className="h-5 w-36 mb-4" />
            <SkeletonBar className="h-24 w-full rounded-xl" />
          </div>
        </div>
      </div>
      <div className="mt-6">
        <GradeHistorySkeleton />
      </div>
    </div>
  );
}
