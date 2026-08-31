function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function StudyGroupSidebarSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <SkeletonBar className="h-5 w-28" />
        <SkeletonBar className="h-4 w-4" />
      </div>
      <SkeletonBar className="h-24 w-full rounded-xl" />
      <div className="mt-4 flex items-center justify-between gap-3">
        <SkeletonBar className="h-3 w-12" />
        <SkeletonBar className="h-9 w-16 rounded-lg" />
      </div>
    </div>
  );
}

export function StudyGroupPostCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 sm:p-6">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBar className="w-11 h-11 rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <SkeletonBar className="h-4 w-32" />
          <SkeletonBar className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2">
        <SkeletonBar className="h-4 w-full" />
        <SkeletonBar className="h-4 w-3/4" />
      </div>
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
        <SkeletonBar className="h-8 w-16 rounded-full" />
        <SkeletonBar className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function StudyGroupPageSkeleton() {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <aside className="space-y-6 xl:order-2 xl:sticky xl:top-20 xl:self-start">
        <StudyGroupSidebarSkeleton />
      </aside>
      <div className="space-y-4 xl:order-1">
        {Array.from({ length: 3 }).map((_, i) => (
          <StudyGroupPostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function StudyGroupPostDetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SkeletonBar className="h-4 w-16" />
      <div className="rounded-2xl p-5 sm:p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
        <div className="flex items-center gap-3 mb-4">
          <SkeletonBar className="w-11 h-11 rounded-full shrink-0 ring-2 ring-border-primary-default-light dark:ring-border-primary-default-dark" />
          <div className="flex-1 space-y-2">
            <SkeletonBar className="h-4 w-32" />
            <SkeletonBar className="h-3 w-20" />
          </div>
        </div>
        <div className="space-y-2">
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-5/6" />
          <SkeletonBar className="h-4 w-2/3" />
        </div>
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
          <SkeletonBar className="h-8 w-16 rounded-full" />
          <SkeletonBar className="h-8 w-16 rounded-full" />
        </div>
      </div>
      <div className="rounded-2xl p-5 sm:p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
        <SkeletonBar className="h-4 w-28 mb-4" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-start gap-2 mb-3">
            <SkeletonBar className="w-7 h-7 rounded-full shrink-0" />
            <div className="flex-1 rounded-2xl rounded-tl-sm bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-3 py-2 space-y-1">
              <SkeletonBar className="h-3 w-20" />
              <SkeletonBar className="h-3 w-full" />
            </div>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-4">
          <SkeletonBar className="flex-1 h-9 rounded-full" />
          <SkeletonBar className="h-9 w-9 rounded-full shrink-0" />
        </div>
      </div>
    </div>
  );
}
