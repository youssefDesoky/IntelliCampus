function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function StatsBannerSkeleton() {
  return (
    <div className="rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark p-4 sm:p-5 col-span-full">
      <SkeletonBar className="h-4 w-32 mb-4 sm:mb-5" />
      <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col items-center py-3 sm:py-0 px-2 sm:border-e sm:border-e-border-primary-default-light dark:sm:border-e-border-primary-default-dark last:sm:border-e-0">
            <SkeletonBar className="h-7 w-12" />
            <SkeletonBar className="h-3 w-20 mt-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MyCourseCardSkeleton() {
  return (
    <div className="rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row gap-4">
        <SkeletonBar className="hidden sm:flex w-14 h-14 rounded-xl shrink-0" />
        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <SkeletonBar className="h-5 w-24 rounded-full" />
            <SkeletonBar className="h-4 w-20" />
            <SkeletonBar className="h-5 w-16 rounded-md" />
          </div>
          <SkeletonBar className="h-5 w-3/4" />
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <SkeletonBar className="w-9 h-9 rounded-full" />
                <div className="space-y-1">
                  <SkeletonBar className="h-3 w-14" />
                  <SkeletonBar className="h-4 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden sm:flex flex-col items-end shrink-0 min-w-[140px] gap-2">
          <SkeletonBar className="h-5 w-24 rounded-md" />
          <SkeletonBar className="h-9 w-full rounded-lg mt-auto" />
          <SkeletonBar className="h-9 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function MyCoursesPageSkeleton({ viewMode }) {
  return (
    <>
      <div className="hidden md:grid grid-cols-4 gap-6 mb-6">
        <StatsBannerSkeleton />
      </div>
      <div className={`mb-6 ${viewMode === "grid" ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}`}>
        {Array.from({ length: viewMode === "grid" ? 4 : 3 }).map((_, i) => (
          <MyCourseCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

export function TranscriptSkeleton() {
  return (
    <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-sm">
      <div className="p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark flex items-center justify-between">
        <div className="space-y-1">
          <SkeletonBar className="h-5 w-40" />
          <SkeletonBar className="h-3 w-28" />
        </div>
        <SkeletonBar className="h-9 w-32 rounded-lg" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark">
              {Array.from({ length: 6 }).map((_, i) => (
                <th key={i} className="px-4 py-3">
                  <SkeletonBar className="h-4 w-16 mx-auto" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, row) => (
              <tr
                key={row}
                className={`border-t border-border-primary-default-light dark:border-border-primary-default-dark ${
                  row % 2 === 0
                    ? "bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark"
                    : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark"
                }`}
              >
                {Array.from({ length: 6 }).map((_, col) => (
                  <td key={col} className="px-4 py-3">
                    <SkeletonBar className={`h-4 ${col === 0 ? "w-20" : col === 1 ? "w-32" : "w-12 mx-auto"}`} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
