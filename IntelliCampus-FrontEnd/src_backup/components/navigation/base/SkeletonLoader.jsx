function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function NotificationItemSkeleton() {
  return (
    <div className="border-b border-border-primary-default-light dark:border-border-primary-default-dark p-4 bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark">
      <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
        <div className="flex items-start gap-2.5 min-w-0">
          <SkeletonBar className="mt-2 flex-shrink-0 w-2 h-2 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <SkeletonBar className="h-4 w-28" />
            <SkeletonBar className="h-3 w-full" />
            <SkeletonBar className="h-3 w-3/4" />
            <SkeletonBar className="h-3 w-16" />
          </div>
        </div>
        <SkeletonBar className="self-start mt-1 flex-shrink-0 h-6 w-16 rounded-md" />
      </div>
    </div>
  );
}

export function NotificationDropdownSkeleton() {
  return (
    <div className="absolute top-full end-0 mt-2 w-80 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      <div className="sticky top-0 p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark flex items-center justify-between">
        <SkeletonBar className="h-5 w-28" />
        <SkeletonBar className="h-7 w-28 rounded-md" />
      </div>

      <div className="flex gap-1 px-3 py-2 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBar key={i} className="h-7 w-16 rounded-full" />
        ))}
      </div>

      {Array.from({ length: 4 }).map((_, i) => (
        <NotificationItemSkeleton key={i} />
      ))}
    </div>
  );
}
