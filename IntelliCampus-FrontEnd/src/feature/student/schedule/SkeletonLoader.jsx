function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function ScheduleHeaderSkeleton() {
  return (
    <div className="space-y-4 mb-4">
      <div className="space-y-2">
        <SkeletonBar className="h-8 w-40" />
        <SkeletonBar className="h-4 w-72" />
      </div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBar className="h-9 w-44 rounded-lg" />
          <SkeletonBar className="h-8 w-px" />
          <SkeletonBar className="h-9 w-32 rounded-lg" />
          <SkeletonBar className="h-9 w-9 rounded-lg lg:hidden" />
        </div>
        <div className="hidden lg:flex items-center gap-3 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark px-4 py-3">
          <div className="space-y-1">
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="h-4 w-28" />
          </div>
          <SkeletonBar className="h-9 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function WeeklyScheduleSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4 mb-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBar key={i} className="h-6 w-20 rounded" />
        ))}
      </div>
      <div className="border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl overflow-hidden">
        <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
          <SkeletonBar className="h-10 m-2" />
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBar key={i} className="h-10 m-2" />
          ))}
        </div>
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="grid grid-cols-[80px_repeat(6,1fr)] border-b border-border-primary-default-light dark:border-border-primary-default-dark last:border-b-0">
            <SkeletonBar className="h-16 m-2" />
            {Array.from({ length: 6 }).map((_, col) => (
              <SkeletonBar key={col} className="h-16 m-2" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function AgendaSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <SkeletonBar className="h-4 w-24" />
            <SkeletonBar className="h-4 w-16" />
          </div>
          <div className="p-4 space-y-4">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-start gap-3">
                <SkeletonBar className="w-1 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2">
                  <SkeletonBar className="h-4 w-3/4" />
                  <SkeletonBar className="h-3 w-1/2" />
                  <SkeletonBar className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ExamCardSkeleton() {
  return (
    <div className="flex flex-row items-stretch gap-3 p-4 md:p-5 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
      <SkeletonBar className="w-20 md:w-24 shrink-0 rounded-xl md:rounded-2xl" />
      <div className="flex-1 min-w-0 space-y-3">
        <div className="flex gap-2">
          <SkeletonBar className="h-5 w-16 rounded-full" />
          <SkeletonBar className="h-5 w-14 rounded-full" />
        </div>
        <SkeletonBar className="h-5 w-3/4" />
        <div className="space-y-1">
          <SkeletonBar className="h-4 w-40" />
          <SkeletonBar className="h-4 w-48" />
        </div>
      </div>
      <div className="flex items-center justify-center ps-2 md:ps-4 border-s border-border-primary-default-light dark:border-border-primary-default-dark w-16 md:w-20 shrink-0">
        <div className="text-center space-y-1">
          <SkeletonBar className="h-7 w-8 mx-auto" />
          <SkeletonBar className="h-3 w-12 mx-auto" />
        </div>
      </div>
    </div>
  );
}

export function ExamScheduleSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <ExamCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ScheduleSkeleton({ isMobile }) {
  return (
    <>
      <ScheduleHeaderSkeleton />
      {isMobile ? <AgendaSkeleton /> : <WeeklyScheduleSkeleton />}
    </>
  );
}
