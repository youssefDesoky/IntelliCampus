import { useTranslation } from "react-i18next";
import {
    BookIcon,
    CheckIcon,
    StarIcon,
} from "../../../components/ui/icons";

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark ${className}`} />;
}

export default function CoursesCard({ courses = [], loading = false }) {
    const { t } = useTranslation('instructor');
    const stats = [
        { label: t('profile.coursesTeaching'), value: courses.length, color: "text-blue-500", icon: BookIcon },
        { label: t('profile.role'), value: t('profile.instructor'), color: "text-purple-500", icon: StarIcon },
        { label: t('profile.status'), value: t('profile.active'), color: "text-emerald-500", icon: CheckIcon },
    ];

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {loading
                    ? [1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                              <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                              <div className="space-y-2 flex-1">
                                  <Skeleton className="h-3 w-16" />
                                  <Skeleton className="h-5 w-12" />
                              </div>
                          </div>
                      ))
                    : stats.map((stat) => (
                          <div key={stat.label} className="flex items-center gap-3 p-4 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark`}>
                                  <stat.icon size={18} />
                              </div>
                              <div>
                                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary-default-light dark:text-text-tertiary-default-dark">{stat.label}</p>
                                  <p className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{stat.value}</p>
                              </div>
                          </div>
                      ))}
            </div>

            <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-linear-to-r from-bg-surface-secondary-default-light to-bg-surface-primary-default-light dark:from-bg-surface-secondary-default-dark dark:to-bg-surface-primary-default-dark">
                    <div>
                        <h3 className="text-sm font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('profile.coursesTaught')}
                        </h3>
                        <p className="text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
                            {t('profile.currentSemester')}
                        </p>
                    </div>
                    {!loading && (
                        <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('profile.courseCount', { count: courses.length })}
                        </span>
                    )}
                </div>
                <div className="p-5">
                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-32" />
                                        <Skeleton className="h-3 w-20" />
                                    </div>
                                    <Skeleton className="h-6 w-20 shrink-0 rounded-full ms-3" />
                                </div>
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-8 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            <BookIcon className="w-12 h-12 mb-4 opacity-40" />
                            <p className="text-sm">{t('profile.noCourses')}</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {courses.map((c) => (
                                <div key={c.id || c.courseId || c._id} className="flex items-center justify-between p-3 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">{c.title}</p>
                                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{c.code || c.courseCode}</p>
                                    </div>
                                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark shrink-0 ms-3">
                                        {t('profile.section', { section: c.section || "—" })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
