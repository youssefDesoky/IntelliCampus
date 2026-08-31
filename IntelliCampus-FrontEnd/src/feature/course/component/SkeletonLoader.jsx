function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function CourseNavBarSkeleton() {
  return (
    <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
      {Array.from({ length: 7 }).map((_, i) => (
        <SkeletonBar key={i} className="h-9 w-28 rounded-lg shrink-0" />
      ))}
    </div>
  );
}

export function CourseContentSkeleton() {
  return (
    <div className="space-y-4 p-6">
      <SkeletonBar className="h-6 w-64" />
      <SkeletonBar className="h-4 w-96" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBar key={i} className="h-32 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function CourseShellSkeleton() {
  return (
    <div className="mb-4">
      <CourseNavBarSkeleton />
      <CourseContentSkeleton />
    </div>
  );
}
