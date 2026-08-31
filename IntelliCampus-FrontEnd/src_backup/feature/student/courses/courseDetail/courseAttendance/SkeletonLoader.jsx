function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function AttendanceOverallSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
      <SkeletonBar className="h-6 w-32 mb-4" />
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBar className="h-4 w-20" />
          <SkeletonBar className="h-8 w-16" />
        </div>
        <SkeletonBar className="h-2 w-full rounded-full" />
        <div className="flex items-center justify-between">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-3 w-24" />
        </div>
      </div>
      <SkeletonBar className="h-10 w-full rounded-lg mt-4" />
    </div>
  );
}

export function AttendanceStatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
      <SkeletonBar className="h-5 w-24 mb-3" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <SkeletonBar className="h-4 w-16" />
            <SkeletonBar className="h-6 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function AttendanceHistorySkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
      <div className="flex items-center justify-between mb-5">
        <SkeletonBar className="h-6 w-40" />
        <SkeletonBar className="h-9 w-24 rounded-lg" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-4 w-16" />
            <SkeletonBar className="h-4 w-16" />
            <SkeletonBar className="h-6 w-6 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseAttendanceSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AttendanceOverallSkeleton />
        <AttendanceStatCardSkeleton />
        <AttendanceStatCardSkeleton />
      </div>
      <AttendanceHistorySkeleton />
    </div>
  );
}
