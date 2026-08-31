import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import Section from "../../../components/ui/Section";
import PageHeader from "../../../components/ui/PageHeader";
import { ChartBarIcon, ClipboardCheckIcon } from "../../../components/ui/icons";
import { fetchAcademicProgress } from "../../../feature/student/services/gradeApi";
import { AcademicProgressSkeleton } from "../../../feature/student/courses/academicProgress/SkeletonLoader";

function BucketCourseRow({ course }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-bg-fill-secondary-default-light dark:hover:bg-bg-fill-secondary-default-dark transition-colors">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
        course.isCompleted
          ? "bg-bg-surface-success-default-light dark:bg-bg-surface-success-default-dark"
          : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark"
      }`}>
        {course.isCompleted && (
          <svg className="w-3 h-3 text-white dark:text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      <span className="text-xs font-mono text-text-secondary-active-light dark:text-text-secondary-active-dark w-20 shrink-0">
        {course.courseCode}
      </span>
      <span className="flex-1 text-sm text-text-primary-default-light dark:text-text-primary-default-dark truncate">
        {course.courseName}
      </span>
      <span className="text-xs font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark shrink-0 w-8 text-end">
        {course.creditHours}
      </span>
    </div>
  );
}

export default function AcademicProgress() {
  const { t } = useTranslation('student');
  const { data, isLoading } = useQuery({
    queryKey: ["academicProgress"],
    queryFn: fetchAcademicProgress,
    staleTime: 5 * 60 * 1000,
  });

  const totalCompleted = data?.totalCompletedHours ?? 0;
  const totalRequired = data?.totalRequiredHours ?? 0;
  const totalGraduationHours = data?.totalGraduationHours ?? totalRequired;
  const gpa = data?.gpa ?? 0;
  const overallPercent = totalGraduationHours > 0 ? Math.round((totalCompleted / totalGraduationHours) * 100) : 0;

  return (
    <div className="flex flex-col min-h-[calc(100vh-160px)]">
      <PageHeader
        title={t('academicProgress.title')}
        subtitle={t('academicProgress.subtitle')}
      />

      {isLoading && <AcademicProgressSkeleton />}

      {!isLoading && data && (
        <>
          <Section className="mb-6">
            <div className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <h2 className="text-xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">
                  {t('academicProgress.completed', { completed: totalCompleted, total: totalGraduationHours })}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="text-end">
                    <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('academicProgress.gpa')} </span>
                    <span className="text-lg font-bold text-text-primary-active-light dark:text-text-primary-active-dark">{gpa.toFixed(2)}</span>
                  </div>
                  <div className="text-end">
                    <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('academicProgress.progress')} </span>
                    <span className="text-lg font-bold text-text-primary-active-light dark:text-text-primary-active-dark">{overallPercent}%</span>
                  </div>
                </div>
              </div>
              <div className="w-full h-3 bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${overallPercent}%`,
                    background: overallPercent >= 80
                      ? "linear-gradient(90deg, #22c55e, #16a34a)"
                      : overallPercent >= 50
                      ? "linear-gradient(90deg, #eab308, #ca8a04)"
                      : "linear-gradient(90deg, #ef4444, #dc2626)"
                  }}
                />
              </div>
            </div>
          </Section>

          <div className="space-y-6 flex-1">
            {data.buckets?.map((bucket) => {
              const pct = bucket.requiredHours > 0
                ? Math.round((bucket.completedHours / bucket.requiredHours) * 100)
                : 0;

              return (
                <Section key={bucket.bucketType} className="overflow-hidden">
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
                        {bucket.bucketName}
                      </h3>
                      <span className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {bucket.completedHours} / {bucket.requiredHours} hrs
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark rounded-full overflow-hidden mb-4">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: pct >= 100
                            ? "linear-gradient(90deg, #22c55e, #16a34a)"
                            : pct >= 50
                            ? "linear-gradient(90deg, #eab308, #ca8a04)"
                            : "linear-gradient(90deg, #3b82f6, #2563eb)"
                        }}
                      />
                    </div>

                    <div className="border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg divide-y divide-border-primary-default-light dark:divide-border-primary-default-dark">
                      {bucket.courses?.length > 0 ? (
                        bucket.courses.map((course) => (
                          <BucketCourseRow key={course.courseId} course={course} />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center py-8 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                          <ClipboardCheckIcon className="w-10 h-10 mb-3 opacity-40" />
                          <p className="text-sm">{t('academicProgress.noCourses')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Section>
              );
            })}
          </div>
        </>
      )}

      {!isLoading && !data && (
        <Section className="p-6">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <ChartBarIcon className="w-12 h-12 mb-4 opacity-40 text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
            <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
              {t('academicProgress.noData')}
            </h3>
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-md">
              {t('academicProgress.noDataDesc')}
            </p>
          </div>
        </Section>
      )}
    </div>
  );
}
