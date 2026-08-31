function SkeletonBar({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded ${className}`}
    />
  );
}

// ============================================================
// INSTRUCTOR COURSES
// ============================================================
function CourseCardSkeleton() {
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

export function InstructorCoursesSkeleton({ viewMode }) {
  const isGrid = viewMode === "grid";
  return (
    <>
      <div className="flex flex-row items-center justify-between gap-4 mb-4">
        <div className="space-y-1 min-w-0">
          <SkeletonBar className="h-7 w-40 md:h-8 md:w-44" />
          <SkeletonBar className="h-3 w-32 md:h-4 md:w-36" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBar className="h-9 w-9 rounded-lg" />
          <SkeletonBar className="h-9 w-9 rounded-lg" />
        </div>
      </div>
      <div className="hidden md:grid grid-cols-3 gap-6 mb-6">
        <div className="rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark p-4 sm:p-5">
          <SkeletonBar className="h-4 w-32 mb-4 sm:mb-5" />
          <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex-1 flex flex-col items-center py-3 sm:py-0 px-2 sm:border-e sm:border-e-border-primary-default-light dark:sm:border-e-border-primary-default-dark last:sm:border-e-0">
                <SkeletonBar className="h-7 w-12" />
                <SkeletonBar className="h-3 w-20 mt-1.5" />
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={`mb-6 ${isGrid ? "flex flex-wrap justify-evenly gap-4 sm:grid sm:grid-cols-2" : "flex flex-col gap-4"}`}>
        {Array.from({ length: isGrid ? 4 : 2 }).map((_, i) => (
          <CourseCardSkeleton key={i} />
        ))}
      </div>
    </>
  );
}

// ============================================================
// MEETING ROOM
// ============================================================
function MeetingCardSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-xl p-4">
      <SkeletonBar className="w-10 h-10 shrink-0 rounded-full" />
      <div className="space-y-2 flex-1 w-full sm:w-auto">
        <SkeletonBar className="h-4 w-3/4 sm:w-48" />
        <SkeletonBar className="h-3 w-1/2 sm:w-32" />
      </div>
      <SkeletonBar className="h-9 w-full sm:w-20 rounded-lg" />
    </div>
  );
}

export function MeetingListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <MeetingCardSkeleton key={i} />
      ))}
    </div>
  );
}

// ============================================================
// COURSE SUB-PAGES (Quizzes, Materials, Grades, Complaints, etc.)
// ============================================================
export function CourseQuizzesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-7 w-24" />
        <SkeletonBar className="h-9 w-36 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <SkeletonBar className="h-5 w-3/4" />
                <SkeletonBar className="h-4 w-1/2" />
              </div>
              <SkeletonBar className="h-6 w-20 rounded-full shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <SkeletonBar className="h-4 w-36" />
              <SkeletonBar className="h-4 w-20" />
              <SkeletonBar className="h-4 w-16" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-tertiary-default-light dark:border-border-tertiary-default-dark">
              <SkeletonBar className="h-8 w-28 rounded-lg" />
              <SkeletonBar className="h-8 w-28 rounded-lg" />
              <SkeletonBar className="h-8 w-16 rounded-lg" />
              <SkeletonBar className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseMaterialsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-7 w-28" />
        <SkeletonBar className="h-9 w-40 rounded-lg" />
      </div>
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="flex items-center gap-3">
              <SkeletonBar className="w-5 h-5 rounded" />
              <SkeletonBar className="h-5 w-40" />
            </div>
            <div className="flex items-center gap-2">
              <SkeletonBar className="h-8 w-8 rounded-lg" />
              <SkeletonBar className="h-8 w-8 rounded-lg" />
            </div>
          </div>
          <div className="p-5 space-y-3">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                <SkeletonBar className="w-8 h-8 rounded-lg shrink-0" />
                <div className="flex-1 space-y-1">
                  <SkeletonBar className="h-4 w-3/4" />
                  <SkeletonBar className="h-3 w-1/3" />
                </div>
                <SkeletonBar className="w-8 h-8 rounded-lg" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function CourseGradesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-7 w-20" />
        <SkeletonBar className="h-9 w-36 rounded-lg" />
      </div>
      <div>
        <SkeletonBar className="h-5 w-44 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SkeletonBar className="w-9 h-9 rounded-lg shrink-0" />
                  <SkeletonBar className="h-3 w-16" />
                </div>
                <SkeletonBar className="h-5 w-14 rounded-full" />
              </div>
              <SkeletonBar className="h-4 w-3/4 mb-3" />
              <div className="flex items-center justify-between mb-2.5">
                <SkeletonBar className="h-3 w-14" />
                <SkeletonBar className="h-3 w-20" />
              </div>
              <SkeletonBar className="h-1.5 w-full rounded-full" />
            </div>
          ))}
        </div>
      </div>
      <div className="hidden sm:block">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBar className="h-5 w-24" />
          <SkeletonBar className="h-3 w-20" />
        </div>
        <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark">
          <div className="p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="flex gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonBar key={i} className="h-4 flex-1" />
              ))}
            </div>
          </div>
          {Array.from({ length: 4 }).map((_, row) => (
            <div key={row} className="p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark last:border-b-0">
              <div className="flex gap-4 items-center">
                <SkeletonBar className="h-4 flex-[2]" />
                {Array.from({ length: 3 }).map((_, col) => (
                  <SkeletonBar key={col} className="h-4 flex-1" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CourseComplaintsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <SkeletonBar className="h-6 w-44" />
          <SkeletonBar className="h-4 w-32" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
            <div className="flex items-start gap-3">
              <SkeletonBar className="w-10 h-10 rounded-lg shrink-0" />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <SkeletonBar className="h-4 w-36" />
                    <SkeletonBar className="h-3 w-24" />
                  </div>
                  <SkeletonBar className="h-5 w-20 rounded-full shrink-0" />
                </div>
                <SkeletonBar className="h-4 w-3/4" />
                <SkeletonBar className="h-3 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseAttendanceSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-7 w-28" />
        <div className="flex items-center gap-3">
          <SkeletonBar className="h-9 w-36 rounded-lg" />
          <SkeletonBar className="h-9 w-36 rounded-lg" />
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <SkeletonBar className="h-4 w-12" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <SkeletonBar key={i} className="h-9 w-28 rounded-xl" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="space-y-2">
                <div className="flex gap-2">
                  <SkeletonBar className="h-5 w-20 rounded-full" />
                  <SkeletonBar className="h-5 w-16 rounded-full" />
                </div>
                <SkeletonBar className="h-6 w-40" />
              </div>
              <SkeletonBar className="w-11 h-11 rounded-2xl shrink-0" />
            </div>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <SkeletonBar className="h-16 rounded-2xl" />
              <SkeletonBar className="h-16 rounded-2xl" />
            </div>
            <SkeletonBar className="h-12 rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseAttendanceDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <SkeletonBar className="w-9 h-9 rounded-xl" />
          <SkeletonBar className="h-7 w-44" />
        </div>
        <div className="flex items-center gap-3">
          <SkeletonBar className="h-9 w-36 rounded-lg" />
          <SkeletonBar className="h-9 w-40 rounded-lg" />
        </div>
      </div>
      <SkeletonBar className="h-5 w-24 mb-4" />
      <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark">
        <div className="p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
          <div className="flex gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBar key={i} className="h-4 flex-1" />
            ))}
          </div>
        </div>
        {Array.from({ length: 5 }).map((_, row) => (
          <div key={row} className="p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark last:border-b-0">
            <div className="flex gap-4 items-center">
              <SkeletonBar className="h-4 flex-1" />
              <SkeletonBar className="h-4 flex-[2]" />
              <SkeletonBar className="h-5 flex-1 rounded-full" />
              <SkeletonBar className="h-4 flex-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseAssignmentsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonBar className="h-7 w-28" />
        <SkeletonBar className="h-9 w-44 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex-1 min-w-0 space-y-2">
                <SkeletonBar className="h-5 w-3/4" />
                <SkeletonBar className="h-4 w-1/2" />
              </div>
              <SkeletonBar className="h-6 w-20 rounded-full shrink-0" />
            </div>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <SkeletonBar className="h-4 w-36" />
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-border-tertiary-default-light dark:border-border-tertiary-default-dark">
              <SkeletonBar className="h-8 w-28 rounded-lg" />
              <SkeletonBar className="h-8 w-16 rounded-lg" />
              <SkeletonBar className="h-8 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CourseAnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg p-6">
        <SkeletonBar className="h-6 w-48 mb-4" />
        <SkeletonBar className="h-[320px] w-full rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg p-6">
          <SkeletonBar className="h-6 w-36 mb-4" />
          <div className="flex items-center justify-center h-[260px]">
            <SkeletonBar className="w-48 h-48 rounded-full" />
          </div>
        </div>
        <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg p-6">
          <SkeletonBar className="h-6 w-44 mb-4" />
          <SkeletonBar className="h-[260px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// COURSE ANNOUNCEMENTS
// ============================================================
function AnnouncementCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5">
      <div className="flex items-start gap-3">
        <SkeletonBar className="w-10 h-10 rounded-lg shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <SkeletonBar className="h-4 w-32" />
            <SkeletonBar className="h-3 w-16" />
          </div>
          <SkeletonBar className="h-4 w-full" />
          <SkeletonBar className="h-4 w-3/4" />
          <div className="flex items-center gap-2 pt-1">
            <SkeletonBar className="h-3 w-28" />
            <SkeletonBar className="h-6 w-14 rounded-lg" />
            <SkeletonBar className="h-6 w-14 rounded-lg" />
            <SkeletonBar className="h-6 w-14 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseAnnouncementsSkeleton() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center justify-between mb-4">
        <SkeletonBar className="h-7 w-32" />
        <SkeletonBar className="h-9 w-44 rounded-lg" />
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <AnnouncementCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// COURSE EXCUSES
// ============================================================
function ExcuseCardSkeleton() {
  return (
    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <SkeletonBar className="w-10 h-10 rounded-xl shrink-0" />
                <div className="min-w-0 space-y-1">
                  <SkeletonBar className="h-4 w-36" />
                  <SkeletonBar className="h-3 w-20" />
                </div>
              </div>
              <SkeletonBar className="h-5 w-20 rounded-full shrink-0" />
            </div>
            <div className="flex flex-wrap gap-3">
              <SkeletonBar className="h-4 w-28" />
              <SkeletonBar className="h-4 w-20" />
              <SkeletonBar className="h-4 w-16" />
            </div>
            <div className="rounded-xl bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark px-4 py-3 space-y-1">
              <SkeletonBar className="h-3 w-12" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-4 w-3/4" />
            </div>
            <SkeletonBar className="h-9 w-44 rounded-lg" />
          </div>
          <div className="flex gap-2 shrink-0 sm:flex-col">
            <SkeletonBar className="h-9 w-full sm:w-24 rounded-lg" />
            <SkeletonBar className="h-9 w-full sm:w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CourseExcusesSkeleton() {
  return (
    <div className="flex flex-col flex-1">
      <div className="flex items-center gap-3 mb-4">
        <SkeletonBar className="w-9 h-9 rounded-lg shrink-0" />
        <div className="flex-1 flex items-center justify-between min-w-0">
          <SkeletonBar className="h-6 w-40" />
          <SkeletonBar className="h-4 w-28 shrink-0" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <ExcuseCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

// ============================================================
// INSTRUCTOR PROFILE
// ============================================================
export function InstructorProfileSkeleton() {
  return (
    <div className="px-4 lg:px-8 py-6 space-y-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-6 lg:hidden">
          <SkeletonBar className="h-64 rounded-3xl" />
          <SkeletonBar className="h-48 rounded-3xl" />
          <SkeletonBar className="h-40 rounded-3xl" />
          <SkeletonBar className="h-32 rounded-3xl" />
        </div>
        <div className="hidden lg:grid grid-cols-[1fr_2fr] gap-6 items-stretch">
          <div className="flex flex-col gap-6">
            <SkeletonBar className="h-80 rounded-3xl" />
            <SkeletonBar className="h-32 rounded-3xl" />
          </div>
          <div className="flex flex-col gap-6">
            <SkeletonBar className="h-48 rounded-3xl" />
            <SkeletonBar className="h-40 rounded-3xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
