function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function DepartmentPreferenceSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2].map((col) => (
          <div key={col} className="space-y-3">
            <SkeletonBar className="h-8 w-44 rounded-lg" />
            <SkeletonBar className="h-10 rounded-xl" />
            {[1, 2, 3].map((i) => (
              <SkeletonBar key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ))}
      </div>
      <SkeletonBar className="h-16 rounded-xl" />
    </div>
  );
}
