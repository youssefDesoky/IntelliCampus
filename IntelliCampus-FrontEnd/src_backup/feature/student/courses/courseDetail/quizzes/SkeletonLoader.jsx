function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

export function QuizStatsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
          <SkeletonBar className="h-4 w-20" />
          <SkeletonBar className="h-6 w-10" />
        </div>
      ))}
    </div>
  );
}

export function QuizCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 animate-pulse">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <SkeletonBar className="h-4 w-4 rounded" />
            <SkeletonBar className="h-4 w-48" />
          </div>
          <SkeletonBar className="h-3 w-full ms-6 mt-2" />
        </div>
        <SkeletonBar className="h-6 w-20 rounded-full shrink-0" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3">
        <div className="col-span-2 sm:col-span-1 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-3">
          <SkeletonBar className="h-3 w-14 mb-2" />
          <SkeletonBar className="h-4 w-24" />
        </div>
        <div className="rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-3">
          <SkeletonBar className="h-3 w-14 mb-2" />
          <SkeletonBar className="h-4 w-16" />
        </div>
        <div className="rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-3">
          <SkeletonBar className="h-3 w-10 mb-2" />
          <SkeletonBar className="h-4 w-12 mb-2" />
          <SkeletonBar className="h-1.5 w-full rounded-full" />
        </div>
      </div>
      <SkeletonBar className="h-10 w-full rounded-lg" />
    </div>
  );
}

export function CourseQuizzesSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6">
      <div className="lg:col-span-2 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-5">
            <SkeletonBar className="h-5 w-5 rounded" />
            <SkeletonBar className="h-5 w-36" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        </div>
        <div>
          <SkeletonBar className="h-5 w-32 mb-1" />
          <SkeletonBar className="h-3 w-64 mb-5" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <QuizCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
      <div className="hidden lg:block space-y-6">
        <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
          <SkeletonBar className="h-5 w-24 mb-4" />
          <QuizStatsSkeleton />
        </div>
      </div>
    </div>
  );
}

export function QuizPracticeHeaderSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden mb-6">
      <div className="px-5 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <SkeletonBar className="h-4 w-28 mb-2" />
            <SkeletonBar className="h-6 w-64" />
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
              <SkeletonBar className="h-10 w-10 rounded-full" />
              <div className="flex flex-col min-w-[4.5rem]">
                <SkeletonBar className="h-4 w-12 mb-1" />
                <SkeletonBar className="h-3 w-16" />
              </div>
            </div>
            <SkeletonBar className="h-9 w-24 rounded-lg" />
          </div>
        </div>
      </div>
      <div className="px-5 sm:px-6 pb-4">
        <div className="flex items-center gap-1">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="h-1.5 flex-1 rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark" />
          ))}
        </div>
        <div className="flex items-center justify-between mt-2">
          <SkeletonBar className="h-3 w-28" />
          <SkeletonBar className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function QuizQuestionCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 animate-pulse">
      <SkeletonBar className="h-3 w-12 mb-3" />
      <SkeletonBar className="h-5 w-3/4 mb-4" />
      <SkeletonBar className="h-5 w-1/2 mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, j) => (
          <div key={j} className="flex items-center gap-3 p-3 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark">
            <SkeletonBar className="h-4 w-4 rounded-full shrink-0" />
            <SkeletonBar className="h-4 w-48" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuizPracticeSidebarSkeleton() {
  return (
    <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 animate-pulse">
      <SkeletonBar className="h-5 w-28 mb-2" />
      <SkeletonBar className="h-5 w-20 mb-4" />
      <SkeletonBar className="h-2 w-full rounded-full mb-4" />
      <div className="grid grid-cols-5 gap-2 mb-4">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="h-8 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark" />
        ))}
      </div>
      <div className="space-y-2 mt-4 pt-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <SkeletonBar className="h-3 w-16" />
            <SkeletonBar className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseQuizPracticeSkeleton() {
  return (
    <div className="max-w-7xl mx-auto relative">
      <QuizPracticeHeaderSkeleton />
      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <QuizQuestionCardSkeleton key={i} />
          ))}
          <div className="flex items-center justify-center pt-2 pb-6 gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-9 w-9 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark animate-pulse" />
            ))}
          </div>
        </div>
        <div className="hidden xl:block w-80 shrink-0">
          <QuizPracticeSidebarSkeleton />
        </div>
      </div>
    </div>
  );
}
