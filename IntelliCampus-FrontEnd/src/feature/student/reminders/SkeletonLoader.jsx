function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function RemindersHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="space-y-2">
        <SkeletonBar className="h-8 w-40" />
        <SkeletonBar className="h-4 w-72" />
      </div>
      <SkeletonBar className="h-9 w-32 rounded-lg" />
    </div>
  );
}

export function MobileDateStripSkeleton() {
  return (
    <div className="flex gap-3 py-2 mb-4 lg:hidden overflow-hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBar key={i} className="min-w-[70px] h-[85px] rounded-2xl shrink-0" />
      ))}
    </div>
  );
}

function ReminderCardSkeleton() {
  return (
    <div className="flex items-start gap-4 w-full">
      <div className="pt-1 space-y-1">
        <SkeletonBar className="h-3 w-10" />
        <SkeletonBar className="h-2 w-8" />
      </div>
      <div className="flex-1 flex items-center gap-3 p-4 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark">
        <SkeletonBar className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBar className="h-4 w-3/4" />
          <SkeletonBar className="h-3 w-1/2" />
        </div>
        <SkeletonBar className="h-6 w-20 rounded-md" />
      </div>
    </div>
  );
}

export function TimelineGroupSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBar className="w-2.5 h-2.5 rounded-full shrink-0" />
        <SkeletonBar className="h-4 w-48" />
        <div className="h-px bg-border-primary-default-light dark:bg-border-primary-default-dark flex-1" />
      </div>
      <div className="space-y-4 ps-1">
        {Array.from({ length: 2 }).map((_, i) => (
          <ReminderCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function TimelineSkeleton() {
  return (
    <div className="lg:col-span-3 md:min-h-0 min-h-0 flex flex-col bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 md:p-6 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark mb-4">
      <div className="flex items-center justify-between mb-6">
        <SkeletonBar className="h-5 w-20" />
        <SkeletonBar className="h-4 w-40" />
      </div>
      <div className="flex flex-col gap-8 flex-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <TimelineGroupSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CalendarSkeleton() {
  return (
    <div className="p-4 md:p-8 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-5 w-32" />
        <div className="flex gap-2">
          <SkeletonBar className="w-8 h-8 rounded-lg" />
          <SkeletonBar className="w-8 h-8 rounded-lg" />
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonBar key={i} className="h-8 w-full" />
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => (
          <SkeletonBar key={i} className="h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

export function CategoriesSkeleton() {
  return (
    <div className="p-4 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark space-y-3">
      <SkeletonBar className="h-5 w-24" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <SkeletonBar className="w-3 h-3 rounded-full" />
          <SkeletonBar className="h-4 flex-1" />
          <SkeletonBar className="h-4 w-6" />
        </div>
      ))}
    </div>
  );
}

export function RemindersSkeleton() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-160px)]">
      <RemindersHeaderSkeleton />
      <MobileDateStripSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-4 grid-rows-1 gap-4 flex-1 min-h-0">
        <TimelineSkeleton />
        <div className="flex flex-col gap-6 min-h-0">
          <div className="hidden lg:block">
            <CalendarSkeleton />
          </div>
          <div className="hidden lg:block">
            <CategoriesSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
