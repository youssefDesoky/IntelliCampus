import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { OpenInNewTabIcon } from "../../../components/ui/icons";

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark ${className}`} />;
}

function isStatus(course, ...statuses) {
    const s = course.status;
    if (s === undefined || s === null) return false;
    return statuses.some((st) => s === st || s === String(st));
}

function buildPerformanceStats(user, t) {
    const courses = user.courses || [];
    const gpa = user.gpa ?? 0;

    const inProgressCourses = courses.filter(
        (c) => isStatus(c, "InProgress", 1) || isStatus(c, "Registered", 0)
    );
    const completedCourses = courses.filter((c) => isStatus(c, "Completed", 2));

    const completedCredits = completedCourses.reduce((sum, c) => sum + (c.creditHours || 0), 0);

    const creditBreakdown = completedCourses.reduce((acc, c) => {
        const hours = c.creditHours || 0;
        const key = hours === 2 ? "2 Hours" : hours === 3 ? "3 Hours" : "Other";
        if (!acc[key]) acc[key] = 0;
        acc[key] += 1;
        return acc;
    }, {});

    const creditOrder = {};
    creditOrder[t("profile.creditHours2")] = 1;
    creditOrder[t("profile.creditHours3")] = 2;

    return [
        {
            label: t("profile.cumulativeGpa"),
            value: `${gpa} / 4.0`,
            trend: gpa > 0 ? t("profile.trendCurrent") : t("profile.notAvailable"),
            positive: gpa >= 2.0 ? true : gpa > 0 ? false : null,
            percentage: `${Math.min(Math.round((gpa / 4.0) * 100), 100)}%`,
            colSpan: 1,
        },
        {
            label: t("profile.currentCourses"),
            value: String(inProgressCourses.length),
            trend: t("profile.trendEnrolled"),
            positive: true,
            percentage: `${inProgressCourses.length > 0 ? 60 : 0}%`,
            colSpan: 1,
        },
        {
            label: t("profile.completedCourses"),
            value: String(completedCourses.length),
            trend: t("profile.trendTotal"),
            positive: true,
            colSpan: 1,
            percentage: completedCourses.length > 0 ? "100%" : "0%",
            subStats: Object.entries(creditBreakdown)
                .sort(([a], [b]) => {
                    return (creditOrder[a] || 99) - (creditOrder[b] || 99);
                })
                .map(([label, count]) => ({
                    label,
                    value: t("profile.courseCount", { count }),
                })),
        },
        {
            label: t("profile.creditsEarned"),
            value: String(completedCredits),
            trend: completedCredits > 0 ? t("profile.trendCompleted") : t("profile.notAvailable"),
            colSpan: 1,
            positive: true,
            percentage: completedCredits > 0 ? "100%" : "0%",
            subStats: [
                {
                    label: t("profile.completedCourses"),
                    value: t("profile.courseCount", { count: completedCourses.length }),
                },
            ],
        },
    ];
}

export default function PerformanceCard({ user = {}, loading = false }) {
    const navigate = useNavigate();
    const { t } = useTranslation('student');
    const performanceStats = useMemo(() => buildPerformanceStats(user, t), [user, t]);

    return (
        <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-linear-to-r from-bg-surface-secondary-default-light to-bg-surface-primary-default-light dark:from-bg-surface-secondary-default-dark dark:to-bg-surface-primary-default-dark">
                <div>
                    <h3 className="text-sm font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t("profile.academicPerformance")}
                    </h3>
                    <p className="text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
                        {t("profile.currentStanding")}
                    </p>
                </div>
                <button
                    onClick={() => navigate("/courses/transcript")}
                    className="flex items-center gap-1 text-[11px] font-semibold text-text-accent-active-light dark:text-text-accent-active-dark hover:underline"
                >
                    {t("profile.fullTranscript")}
                    <OpenInNewTabIcon size={12} />
                </button>
            </div>

            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 flex flex-col">
                                <div className="flex items-start justify-between gap-3 mb-3">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <Skeleton className="h-2.5 w-2.5 rounded-full shrink-0 mt-1" />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <Skeleton className="h-3 w-20" />
                                            <Skeleton className="h-5 w-16" />
                                        </div>
                                    </div>
                                    <Skeleton className="h-6 w-14 shrink-0 rounded-full" />
                                </div>
                                <Skeleton className="h-1.5 w-full mt-auto rounded-full" />
                            </div>
                        ))}
                    </>
                ) : (
                    performanceStats.map((stat) => (
                        <div
                            key={stat.label}
                            className={`rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 hover:border-border-accent-default-light dark:hover:border-border-accent-default-dark transition-colors group flex flex-col ${
                                stat.colSpan === 2 ? 'sm:col-span-2' : 'sm:col-span-1'
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    <span
                                        className={`h-2.5 w-2.5 rounded-full shrink-0 mt-1 ${
                                            stat.positive === true
                                                ? "bg-green-400"
                                                : stat.positive === false
                                                ? "bg-red-400"
                                                : "bg-text-tertiary-default-light dark:bg-text-tertiary-default-dark opacity-40"
                                        }`}
                                    />
                                    <div className="min-w-0">
                                        <span className="block text-[11px] font-bold uppercase tracking-wider text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                            {stat.label}
                                        </span>
                                        <span className="block text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark leading-tight">
                                            {stat.value}
                                        </span>
                                    </div>
                                </div>
                                <span
                                    className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                        stat.positive === true
                                            ? "bg-green-400/10 text-green-500 border border-green-400/20"
                                            : stat.positive === false
                                            ? "bg-red-400/10 text-red-400 border border-red-400/20"
                                            : "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark"
                                    }`}
                                >
                                    {stat.trend}
                                </span>
                            </div>

                            {stat.subStats && (
                                <div className="mb-3 grid grid-cols-1 gap-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark pt-2.5">
                                    {stat.subStats.map((sub) => (
                                        <div key={sub.label} className="flex justify-between text-xs">
                                            <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{sub.label}</span>
                                            <span className="font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{sub.value}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="h-1.5 mt-auto rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden">
                                <div
                                    className={`h-full rounded-full ${
                                        stat.positive === true
                                            ? "bg-green-400"
                                            : stat.positive === false
                                            ? "bg-red-400"
                                            : "bg-text-accent-active-light dark:bg-text-accent-active-dark"
                                    }`}
                                    style={{ width: stat.percentage || '0%' }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
