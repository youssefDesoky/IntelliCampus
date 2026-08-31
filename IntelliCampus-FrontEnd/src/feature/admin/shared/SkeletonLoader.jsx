function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function ManageContentSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1">
          <SkeletonBar className="h-10 w-full max-w-xs rounded-lg" />
          <SkeletonBar className="h-10 w-10 rounded-lg" />
          <SkeletonBar className="h-10 w-10 rounded-lg" />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <SkeletonBar className="h-8 w-24 rounded-full" />
        <SkeletonBar className="h-8 w-24 rounded-full" />
      </div>
      <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
          <SkeletonBar className="h-4 w-8 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonBar key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark last:border-b-0">
            <SkeletonBar className="h-4 w-4 rounded" />
            <SkeletonBar className="h-5 w-10 rounded-full shrink-0" />
            <SkeletonBar className="h-5 flex-[2]" />
            <SkeletonBar className="h-5 flex-1" />
            <SkeletonBar className="h-5 flex-1" />
            <SkeletonBar className="h-5 flex-1 hidden sm:block" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailsHeaderSkeleton({ showAvatar = true }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-8">
      <div className="flex items-center gap-4 min-w-0">
        <SkeletonBar className="w-10 h-10 rounded-xl shrink-0" />
        {showAvatar && <SkeletonBar className="w-14 h-14 rounded-2xl shrink-0 hidden sm:block" />}
        <div className="space-y-2 min-w-0">
          <SkeletonBar className="h-7 w-48" />
          <SkeletonBar className="h-4 w-32" />
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <SkeletonBar className="h-9 w-24 rounded-lg" />
        <SkeletonBar className="h-9 w-20 rounded-lg" />
      </div>
    </div>
  );
}

export function StatCardsSkeleton({ count = 4 }) {
  return (
    <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
          <SkeletonBar className="w-10 h-10 rounded-lg shrink-0" />
          <div className="space-y-2 flex-1">
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function InfoFieldsSkeleton({ count = 6, columns = 2 }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-${columns} gap-x-8 gap-y-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <SkeletonBar className="h-3 w-20" />
          <SkeletonBar className="h-4 w-32" />
        </div>
      ))}
    </div>
  );
}

export function ProfileCardSkeleton() {
  return (
    <div className="rounded-3xl border border-border-primary-default-light/70 dark:border-border-primary-default-dark/70 bg-bg-surface-primary-default-light/80 dark:bg-bg-surface-primary-default-dark/80 overflow-hidden">
      <SkeletonBar className="h-32 w-full rounded-none" />
      <div className="px-6 pb-6">
        <div className="flex items-end gap-4 -mt-14 mb-4">
          <SkeletonBar className="w-24 h-24 rounded-2xl border-4 border-bg-surface-primary-default-light dark:border-bg-surface-primary-default-dark" />
          <div className="space-y-2 flex-1 pb-2">
            <SkeletonBar className="h-6 w-40" />
            <SkeletonBar className="h-4 w-24" />
          </div>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <SkeletonBar className="w-4 h-4 rounded" />
              <SkeletonBar className="h-4 w-32" />
            </div>
          ))}
        </div>
        <SkeletonBar className="h-10 w-full rounded-xl mt-4" />
      </div>
    </div>
  );
}

export function ProfileStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
          <SkeletonBar className="h-10 w-10 shrink-0 rounded-lg" />
          <div className="space-y-2 flex-1">
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="h-5 w-12" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileInfoSkeleton() {
  return (
    <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
      <div className="px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        <SkeletonBar className="h-4 w-32" />
        <SkeletonBar className="h-3 w-24 mt-1" />
      </div>
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
            <SkeletonBar className="h-9 w-9 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBar className="h-3 w-16" />
              <SkeletonBar className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TabButtonsSkeleton({ count = 3 }) {
  return (
    <div className="flex gap-1 mb-6 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBar key={i} className={`h-10 rounded-none border-b-2 border-transparent ${i === 0 ? 'w-28' : 'w-24'}`} />
      ))}
    </div>
  );
}

export function StudentDetailsSkeleton() {
  return (
    <div className="p-0 sm:p-6">
      <DetailsHeaderSkeleton />
      <div className="flex gap-1 mb-6 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBar key={i} className={`h-10 ${i === 0 ? 'w-28' : 'w-24'}`} />
        ))}
      </div>
      <div className="space-y-6">
        <StatCardsSkeleton />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark p-6 flex flex-col items-center">
              <SkeletonBar className="w-36 h-36 rounded-2xl mb-5" />
              <SkeletonBar className="h-6 w-40 mb-2" />
              <SkeletonBar className="h-4 w-24 mb-6" />
              <div className="grid grid-cols-2 gap-3 w-full">
                <SkeletonBar className="h-20 rounded-xl" />
                <SkeletonBar className="h-20 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden">
              <SkeletonBar className="h-12 w-full rounded-none" />
              <div className="p-5">
                <InfoFieldsSkeleton count={4} columns={2} />
              </div>
            </div>
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden">
              <SkeletonBar className="h-12 w-full rounded-none" />
              <div className="p-5">
                <InfoFieldsSkeleton count={5} columns={2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function InstructorDetailsSkeleton() {
  return (
    <div className="p-3 sm:p-6">
      <DetailsHeaderSkeleton />
      <div className="flex gap-1 mb-6 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        {Array.from({ length: 2 }).map((_, i) => (
          <SkeletonBar key={i} className={`h-10 ${i === 0 ? 'w-28' : 'w-24'}`} />
        ))}
      </div>
      <div className="space-y-6">
        <StatCardsSkeleton count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark p-6 flex flex-col items-center">
              <SkeletonBar className="w-36 h-36 rounded-2xl mb-5" />
              <SkeletonBar className="h-6 w-40 mb-2" />
              <SkeletonBar className="h-4 w-24 mb-6" />
              <div className="grid grid-cols-2 gap-3 w-full">
                <SkeletonBar className="h-20 rounded-xl" />
                <SkeletonBar className="h-20 rounded-xl" />
              </div>
            </div>
          </div>
          <div className="lg:col-span-3 space-y-4">
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden">
              <SkeletonBar className="h-12 w-full rounded-none" />
              <div className="p-5">
                <InfoFieldsSkeleton count={8} columns={2} />
              </div>
            </div>
            <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden">
              <SkeletonBar className="h-12 w-full rounded-none" />
              <div className="p-5">
                <InfoFieldsSkeleton count={4} columns={2} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BylawDetailsSkeleton() {
  return (
    <div className="p-0 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <SkeletonBar className="w-10 h-10 rounded-xl shrink-0" />
          <div className="space-y-2">
            <SkeletonBar className="h-7 w-48" />
            <SkeletonBar className="h-4 w-64" />
          </div>
        </div>
        <SkeletonBar className="h-6 w-20 rounded-full" />
      </div>
      <div className="flex gap-1 mb-6 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        {Array.from({ length: 5 }).map((_, i) => (
          <SkeletonBar key={i} className="h-10 w-24" />
        ))}
      </div>
      <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark p-6 space-y-6">
        <div className="flex items-center justify-between">
          <SkeletonBar className="h-5 w-40" />
          <div className="flex gap-2">
            <SkeletonBar className="h-9 w-24 rounded-lg" />
            <SkeletonBar className="h-9 w-16 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkeletonBar className="h-32 rounded-xl" />
          <SkeletonBar className="h-32 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function CourseClassesSkeleton() {
  return (
    <div className="p-0 sm:p-6">
      <DetailsHeaderSkeleton />
      <div className="flex gap-1 mb-6 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonBar key={i} className={`h-10 ${i === 0 ? 'w-28' : 'w-24'}`} />
        ))}
      </div>
      <div className="space-y-6">
        <div className="flex items-center gap-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-xl px-4 py-3 border">
          <div className="flex-1 space-y-1">
            <SkeletonBar className="h-4 w-40" />
            <SkeletonBar className="h-3 w-56" />
          </div>
          <SkeletonBar className="h-8 w-24 rounded-lg" />
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <SkeletonBar className="h-8 w-8 rounded-md" />
            <SkeletonBar className="h-5 w-24" />
            <div className="ms-auto">
              <SkeletonBar className="h-8 w-28 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark space-y-4">
                <div className="flex items-center justify-between">
                  <SkeletonBar className="h-6 w-20 rounded-full" />
                  <div className="flex gap-1">
                    <SkeletonBar className="w-7 h-7 rounded-lg" />
                    <SkeletonBar className="w-7 h-7 rounded-lg" />
                  </div>
                </div>
                <SkeletonBar className="h-5 w-36" />
                <SkeletonBar className="h-4 w-24" />
                <div className="flex items-center justify-between pt-3.5 border-t">
                  <div className="flex items-center gap-2">
                    <SkeletonBar className="w-7 h-7 rounded-full" />
                    <SkeletonBar className="h-4 w-20" />
                  </div>
                  <SkeletonBar className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4">
            <SkeletonBar className="h-8 w-8 rounded-md" />
            <SkeletonBar className="h-5 w-24" />
            <div className="ms-auto">
              <SkeletonBar className="h-8 w-28 rounded-lg" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="p-5 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark space-y-4">
                <div className="flex items-center justify-between">
                  <SkeletonBar className="h-6 w-20 rounded-full" />
                  <div className="flex gap-1">
                    <SkeletonBar className="w-7 h-7 rounded-lg" />
                    <SkeletonBar className="w-7 h-7 rounded-lg" />
                  </div>
                </div>
                <SkeletonBar className="h-5 w-36" />
                <SkeletonBar className="h-4 w-24" />
                <div className="flex items-center justify-between pt-3.5 border-t">
                  <div className="flex items-center gap-2">
                    <SkeletonBar className="w-7 h-7 rounded-full" />
                    <SkeletonBar className="h-4 w-20" />
                  </div>
                  <SkeletonBar className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TabTableSkeleton({ rows = 5 }) {
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden">
      <div className="flex items-center gap-4 px-4 py-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonBar key={i} className={`h-4 ${i === 0 ? 'w-24' : 'flex-1'}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark last:border-b-0">
          <SkeletonBar className="h-5 w-16" />
          <SkeletonBar className="h-5 flex-[2]" />
          <SkeletonBar className="h-5 flex-1" />
          <div className="flex gap-2">
            <SkeletonBar className="h-8 w-20 rounded-lg" />
            <SkeletonBar className="h-8 w-20 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CourseStudentsTabSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <SkeletonBar className="h-10 w-64 rounded-lg" />
        <SkeletonBar className="h-4 w-32" />
      </div>
      <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden">
        <div className="flex items-center gap-4 px-4 py-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
          <SkeletonBar className="h-4 flex-[2]" />
          <SkeletonBar className="h-4 flex-1" />
          <SkeletonBar className="h-4 flex-1 hidden sm:table-cell" />
          <SkeletonBar className="h-4 w-16 hidden md:table-cell" />
          <SkeletonBar className="h-4 w-16 hidden md:table-cell" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark last:border-b-0">
            <div className="flex items-center gap-3 flex-[2]">
              <SkeletonBar className="w-8 h-8 rounded-full shrink-0" />
              <SkeletonBar className="h-4 w-32" />
            </div>
            <SkeletonBar className="h-4 w-20 flex-1" />
            <SkeletonBar className="h-4 w-28 flex-1 hidden sm:table-cell" />
            <SkeletonBar className="h-4 w-12 hidden md:table-cell" />
            <SkeletonBar className="h-4 w-12 hidden md:table-cell" />
          </div>
        ))}
      </div>
    </div>
  );
}

export { DashboardSkeleton, KpiCardSkeleton, ChartSkeleton, AlertSkeleton } from "../../admin/dashboard/components/SkeletonLoader";
