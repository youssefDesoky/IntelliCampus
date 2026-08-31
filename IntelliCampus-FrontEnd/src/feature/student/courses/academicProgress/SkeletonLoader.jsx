function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function AcademicProgressSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-6">
          <SkeletonBar className="h-5 w-48 mb-3" />
          <SkeletonBar className="h-3 w-32 mb-4" />
          <SkeletonBar className="h-3 w-full mb-6" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3">
                <SkeletonBar className="h-5 w-5 rounded-full" />
                <SkeletonBar className="h-4 w-24" />
                <SkeletonBar className="h-4 flex-1" />
                <SkeletonBar className="h-4 w-8" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
