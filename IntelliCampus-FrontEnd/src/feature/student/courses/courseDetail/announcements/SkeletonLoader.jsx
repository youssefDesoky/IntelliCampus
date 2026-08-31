function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function AnnouncementCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
      <div className="flex items-start gap-3 mb-4">
        <SkeletonBar className="w-10 h-10 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBar className="h-4 w-48" />
          <SkeletonBar className="h-3 w-32" />
        </div>
      </div>
      <div className="space-y-2 ms-[52px]">
        <SkeletonBar className="h-4 w-3/4" />
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-2/3" />
      </div>
      <div className="flex items-center gap-2 mt-4 ms-[52px]">
        <SkeletonBar className="h-8 w-20 rounded-lg" />
        <SkeletonBar className="h-8 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function CourseAnnouncementsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <AnnouncementCardSkeleton key={i} />
      ))}
    </div>
  );
}
