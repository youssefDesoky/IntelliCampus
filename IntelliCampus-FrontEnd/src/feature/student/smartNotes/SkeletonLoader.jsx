function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function SmartNotesSearchSkeleton() {
  return (
    <div className="p-4 lg:p-6 mb-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="w-full lg:w-fit flex items-center justify-between gap-4">
          <SkeletonBar className="h-10 w-64 rounded-lg" />
          <div className="hidden lg:flex items-center gap-1">
            <SkeletonBar className="h-9 w-9 rounded-lg" />
            <SkeletonBar className="h-9 w-9 rounded-lg" />
          </div>
        </div>
        <div className="hidden lg:block">
          <SkeletonBar className="h-10 w-36 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SmartNoteCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
      <div className="p-5 space-y-3">
        <SkeletonBar className="h-5 w-3/4" />
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-2/3" />
        <div className="pt-3 flex items-center justify-between">
          <SkeletonBar className="h-3 w-24" />
          <SkeletonBar className="h-8 w-8 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function SmartNotesPageSkeleton({ isPhone, isTablet, viewMode }) {
  const getCols = () => {
    if (isPhone) return 1;
    if (isTablet) return viewMode === "list" ? 1 : 2;
    return viewMode === "grid-3" ? 3 : 2;
  };
  const cols = getCols();
  return (
    <>
      <SmartNotesSearchSkeleton />
      <div
        className={`grid ${isPhone ? "grid-cols-1" : isTablet ? (viewMode === "list" ? "grid-cols-1" : "grid-cols-2") : viewMode === "grid-3" ? "grid-cols-3" : "grid-cols-2"} gap-6 mb-4`}
      >
        {Array.from({ length: cols * 2 }).map((_, i) => (
          <SmartNoteCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
