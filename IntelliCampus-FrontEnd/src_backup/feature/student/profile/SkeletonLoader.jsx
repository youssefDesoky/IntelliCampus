function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function IdentityCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border-primary-default-light/70 dark:border-border-primary-default-dark/70 bg-bg-surface-primary-default-light/80 dark:bg-bg-surface-primary-default-dark/80 overflow-hidden">
      <div className="relative h-32 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
        <SkeletonBar className="absolute top-4 end-4 h-8 w-28 rounded-xl" />
      </div>
      <div className="relative -mt-14 px-6 z-10">
        <div className="flex items-end gap-4">
          <SkeletonBar className="w-24 h-24 rounded-2xl shrink-0" />
          <div className="pb-2 flex-1 space-y-2">
            <SkeletonBar className="h-6 w-40" />
            <SkeletonBar className="h-4 w-28" />
          </div>
        </div>
      </div>
      <div className="px-6 mt-6 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2.5">
            <SkeletonBar className="h-4 w-4 shrink-0" />
            <SkeletonBar className="h-4 w-48" />
          </div>
        ))}
      </div>
      <div className="pt-4 pb-5 px-6 mt-4">
        <SkeletonBar className="h-10 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function AccountControlsCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
      <div className="px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark space-y-1">
        <SkeletonBar className="h-3 w-24" />
        <SkeletonBar className="h-4 w-44" />
      </div>
      <div className="p-5 space-y-2.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-3.5 py-2.5">
            <SkeletonBar className="h-3 w-20" />
            <SkeletonBar className="h-5 w-9 rounded-full" />
          </div>
        ))}
      </div>
      <div className="px-5 pb-5 grid grid-cols-2 gap-2">
        <SkeletonBar className="h-9 w-full rounded-xl" />
        <SkeletonBar className="h-9 w-full rounded-xl" />
      </div>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr] items-stretch">
          <div className="flex h-full flex-col gap-6 lg:sticky lg:top-6 self-start">
            <IdentityCardSkeleton />
            <AccountControlsCardSkeleton />
          </div>
          <div className="flex h-full flex-col gap-6">
            <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
              <div className="px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark space-y-1">
                <SkeletonBar className="h-4 w-32" />
                <SkeletonBar className="h-3 w-40" />
              </div>
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className={`flex items-center gap-3.5 p-3.5 rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark ${i === 4 ? "sm:col-span-2" : ""}`}>
                    <SkeletonBar className="h-9 w-9 shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <SkeletonBar className="h-3 w-16" />
                      <SkeletonBar className="h-4 w-24" />
                    </div>
                    {i === 4 && <SkeletonBar className="h-9 w-9 shrink-0 rounded-xl" />}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
              <div className="px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark flex items-center justify-between">
                <div className="space-y-1">
                  <SkeletonBar className="h-4 w-32" />
                  <SkeletonBar className="h-3 w-36" />
                </div>
                <SkeletonBar className="h-4 w-20" />
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 flex flex-col">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <SkeletonBar className="h-2.5 w-2.5 rounded-full shrink-0 mt-1" />
                        <div className="flex-1 space-y-2">
                          <SkeletonBar className="h-3 w-20" />
                          <SkeletonBar className="h-5 w-16" />
                        </div>
                      </div>
                      <SkeletonBar className="h-6 w-14 shrink-0 rounded-full" />
                    </div>
                    <SkeletonBar className="h-1.5 w-full mt-auto rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
