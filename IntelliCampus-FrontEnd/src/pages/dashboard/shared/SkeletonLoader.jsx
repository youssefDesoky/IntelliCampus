function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function InboxHeaderSkeleton() {
  return (
    <div className="flex items-center justify-between gap-3 mb-4">
      <div className="flex items-center gap-3">
        <SkeletonBar className="w-6 h-6 rounded" />
        <SkeletonBar className="h-7 w-24" />
        <SkeletonBar className="h-5 w-20" />
      </div>
      <div className="flex items-center gap-3">
        <SkeletonBar className="h-9 w-28 rounded-lg" />
        <SkeletonBar className="h-9 w-44 sm:w-64 rounded-lg" />
      </div>
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <SkeletonBar key={i} className="h-8 w-20 rounded-full" />
      ))}
    </div>
  );
}

export function MessageRowSkeleton() {
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
      <div className="flex items-start gap-3 px-4 py-3">
        <SkeletonBar className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <SkeletonBar className="h-4 w-32" />
              <SkeletonBar className="h-4 w-14 rounded-full shrink-0" />
              <SkeletonBar className="h-4 w-16 rounded-full shrink-0" />
            </div>
            <SkeletonBar className="h-3 w-16 shrink-0" />
          </div>
          <SkeletonBar className="h-4 w-3/4 mt-1.5" />
          <SkeletonBar className="h-3 w-1/2 mt-1" />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <SkeletonBar className="w-8 h-8 rounded" />
          <SkeletonBar className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

export function InboxMessageListSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <MessageRowSkeleton key={i} />
      ))}
    </div>
  );
}

export function InboxSkeleton() {
  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] md:h-[calc(100vh-10rem)]">
      <InboxHeaderSkeleton />
      <FilterBarSkeleton />
      <div className="flex-1 overflow-y-auto">
        <InboxMessageListSkeleton />
      </div>
    </div>
  );
}
