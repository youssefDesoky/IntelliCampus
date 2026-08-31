import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/ui/Button";
import BaseComponent from "../../../../components/ui/BaseComponent";
import { CheckIcon, XIcon, FileIcon, CalendarDaysIcon, ClockIcon, UserIcon, WarningIcon } from "../../../../components/ui/icons";
import { fetchExcuses, updateExcuseStatus } from "./instructorAttendanceApi";
import { useError } from "../../../../contexts/ErrorContext.jsx";

const STATUS_STYLES = {
    Pending: "bg-bg-surface-amber-default-light text-text-warning-active-light dark:bg-bg-surface-amber-default-dark dark:text-text-warning-active-dark",
    Approved: "bg-bg-surface-success-default-light text-text-success-active-light dark:bg-bg-surface-success-default-dark dark:text-text-success-active-dark",
    Rejected: "bg-bg-surface-danger-default-light text-text-danger-active-light dark:bg-bg-surface-danger-default-dark dark:text-text-danger-active-dark",
};

export default function ExcuseList({ courseId }) {
    const { t } = useTranslation('instructor');
    const [excuses, setExcuses] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showError } = useError();

    const loadExcuses = useCallback(async () => {
        if (!courseId) return;
        setLoading(true);
        try {
            const data = await fetchExcuses(courseId);
            setExcuses(Array.isArray(data) ? data : []);
        } catch (err) {
            showError(err.message || t('excuses.errorLoad'));
            setExcuses([]);
        } finally {
            setLoading(false);
        }
    }, [courseId, showError]);

    useEffect(() => {
        loadExcuses();
    }, [loadExcuses]);

    const handleStatusUpdate = async (excuseId, status) => {
        try {
            await updateExcuseStatus(excuseId, status);
            setExcuses(prev => prev.map(e =>
                e.excuseId === excuseId || e.id === excuseId ? { ...e, status } : e
            ));
        } catch (err) {
            showError(err.message || (status === "Approved" ? t('excuses.errorApprove') : t('excuses.errorReject')));
        }
    };

    if (loading) {
        return (
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-8 text-center">
                {t('excuses.loading')}
            </p>
        );
    }

    if (excuses.length === 0) {
        return (
            <div className="rounded-3xl border border-dashed border-border-primary-default-light bg-bg-surface-primary-default-light p-8 text-center dark:border-border-primary-default-dark dark:bg-bg-surface-primary-default-dark">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-bg-surface-secondary-default-light text-text-accent-default-light dark:bg-bg-surface-secondary-default-dark dark:text-text-accent-default-dark">
                    <WarningIcon className="h-7 w-7" />
                </div>
                <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('excuses.noExcuses')}
                </h2>
                <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    {t('excuses.noExcusesDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {excuses.map((excuse) => {
                const eid = excuse.excuseId || excuse.id;
                const status = excuse.status || "Pending";
                const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.Pending;
                const isPending = status === "Pending";

                return (
                    <BaseComponent
                        key={eid}
                        className="border-border-primary-default-light dark:border-border-primary-default-dark"
                        contentClassName=""
                    >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div className="flex-1 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-accent-default-light dark:text-text-accent-default-dark">
                                            <UserIcon className="h-5 w-5" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                                {excuse.studentName || excuse.studentFullName || t('excuses.unknownStudent')}
                                            </p>
                                            {excuse.studentCode && (
                                                <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                    {excuse.studentCode}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`shrink-0 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusStyle}`}>
                                        {status}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {excuse.sessionDate && (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                            <CalendarDaysIcon size={14} />
                                            {excuse.sessionDate}
                                        </span>
                                    )}
                                    {excuse.sessionTime && (
                                        <span className="inline-flex items-center gap-1.5 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                            <ClockIcon size={14} />
                                            {excuse.sessionTime}
                                        </span>
                                    )}
                                    {excuse.sessionType && (
                                        <span className="inline-flex items-center rounded-full border border-border-primary-default-light px-2 py-0.5 text-xs font-medium text-text-secondary-default-light dark:border-border-primary-default-dark dark:text-text-secondary-default-dark">
                                            {excuse.sessionType}
                                        </span>
                                    )}
                                </div>

                                <div className="rounded-xl bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">
                                        {t('excuses.reason')}
                                    </p>
                                    <p className="text-sm text-text-primary-default-light dark:text-text-primary-default-dark leading-6">
                                        {excuse.reason || t('excuses.noReason')}
                                    </p>
                                </div>

                                {excuse.documentUrl && (
                                    <a
                                        href={excuse.documentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 rounded-lg border border-border-primary-default-light bg-bg-surface-secondary-default-light px-3 py-2 text-sm font-medium text-text-accent-default-light transition-colors hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-accent-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
                                    >
                                        <FileIcon size={16} />
                                        {excuse.fileName || t('excuses.viewDocument')}
                                    </a>
                                )}
                            </div>

                            {isPending && (
                                <div className="flex gap-2 shrink-0 sm:flex-col">
                                    <Button
                                        variant="success"
                                        size="sm"
                                        startIcon={<CheckIcon size={16} />}
                                        onClick={() => handleStatusUpdate(eid, "Approved")}
                                        className="w-full"
                                    >
                                        {t('excuses.approve')}
                                    </Button>
                                    <Button
                                        variant="danger"
                                        size="sm"
                                        startIcon={<XIcon size={16} />}
                                        onClick={() => handleStatusUpdate(eid, "Rejected")}
                                        className="w-full"
                                    >
                                        {t('excuses.reject')}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </BaseComponent>
                );
            })}
        </div>
    );
}
