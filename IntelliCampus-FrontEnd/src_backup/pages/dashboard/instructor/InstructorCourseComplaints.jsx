import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchCourseComplaints, updateComplaintStatus } from "../../../feature/instructor/services/gradesApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { ExclamationIcon, CheckIcon, XIcon, BrainIcon, FilePenIcon, ChartBarIcon, ClockIcon, ArrowLeftIcon } from "../../../components/ui/icons";
import Button from "../../../components/ui/Button";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import TextArea from "../../../components/ui/TextArea";
import { CourseComplaintsSkeleton } from "../../../feature/instructor/SkeletonLoader";

const COMPLAINT_TYPE_ICON = {
    Quiz: <BrainIcon size={16} />,
    Assignment: <FilePenIcon size={16} />,
    Midterm: <ChartBarIcon size={16} />,
    Project: <ChartBarIcon size={16} />,
    Final: <ChartBarIcon size={16} />,
};

const COMPLAINT_TYPE_CLS = {
    Quiz: "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark",
    Assignment: "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-accent-light dark:text-text-blue-accent-dark",
    Midterm: "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark text-text-amber-accent-light dark:text-text-amber-accent-dark",
    Project: "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark text-text-amber-accent-light dark:text-text-amber-accent-dark",
    Final: "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark text-text-amber-accent-light dark:text-text-amber-accent-dark",
};

function getStatusBadgeCls(status) {
    switch (status) {
        case "pending":
            return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
        case "resolved":
            return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300";
        case "rejected":
            return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300";
        default:
            return "bg-bg-surface-tertiary-default-light dark:bg-bg-surface-tertiary-default-dark text-text-tertiary-default-light dark:text-text-tertiary-default-dark";
    }
}

export default function InstructorCourseComplaints() {
    const { t } = useTranslation('instructor');
    const { courseId } = useOutletContext();
    const { showError } = useError();
    const { showToast } = useToast();
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [responseText, setResponseText] = useState("");

    const {
        data: complaints = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["instructorCourseComplaints", courseId],
        queryFn: () => fetchCourseComplaints(courseId),
        staleTime: 5 * 60 * 1000,
        enabled: !!courseId,
    });

    useEffect(() => {
        if (error) showError(error.message || "Failed to load complaints");
    }, [error, showError]);

    const respondMutation = useMutation({
        mutationFn: ({ complaintId, data }) => updateComplaintStatus(complaintId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["instructorCourseComplaints", courseId] });
            showToast({ type: "success", title: t('complaints.updated'), message: t('complaints.updatedMessage') });
            setSelectedComplaint(null);
            setResponseText("");
        },
        onError: (err) => showError(err.message || "Failed to update complaint"),
    });

    const openDetail = (complaint) => {
        setSelectedComplaint(complaint);
        setResponseText(complaint.instructorResponse || "");
    };

    const closeDetail = () => {
        if (respondMutation.isPending) return;
        setSelectedComplaint(null);
        setResponseText("");
    };

    const handleResolve = () => {
        if (!selectedComplaint) return;
        respondMutation.mutate({
            complaintId: selectedComplaint.id,
            data: { status: "resolved", instructorResponse: responseText.trim() },
        });
    };

    const handleReject = () => {
        if (!selectedComplaint) return;
        respondMutation.mutate({
            complaintId: selectedComplaint.id,
            data: { status: "rejected", instructorResponse: responseText.trim() },
        });
    };

    const handleUpdateResponse = () => {
        if (!selectedComplaint) return;
        respondMutation.mutate({
            complaintId: selectedComplaint.id,
            data: { status: selectedComplaint.status, instructorResponse: responseText.trim() },
        });
    };

    if (isLoading) {
        return <CourseComplaintsSkeleton />;
    }

    const pendingCount = complaints.filter((c) => c.status === "pending").length;

    return (
        <div className="flex flex-col flex-1">
            <div className="flex items-center gap-3 mb-4">
                <button
                    type="button"
                    onClick={() => navigate("../grades")}
                    className="shrink-0 p-1.5 rounded-lg text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                >
                    <ArrowLeftIcon size={20} className="rtl:scale-x-[-1]" />
                </button>
                <div className="flex-1 flex items-center justify-between min-w-0">
                    <h2 className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{t('complaints.title')}</h2>
                    <p className="shrink-0 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t('complaints.count', { count: complaints.length })}
                        {pendingCount > 0 ? ` (${t('complaints.pendingCount', { count: pendingCount })})` : ""}
                    </p>
                </div>
            </div>

            {complaints.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                    <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('complaints.noComplaints')}</h3>
                    <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t('complaints.noComplaintsDesc')}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {complaints.map((complaint) => (
                        <button
                            key={complaint.id}
                            type="button"
                            onClick={() => openDetail(complaint)}
                            className="w-full text-start rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                        >
                            <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-lg shrink-0 ${COMPLAINT_TYPE_CLS[complaint.complaintType] || "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark"}`}>
                                    {COMPLAINT_TYPE_ICON[complaint.complaintType] || <ExclamationIcon size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="min-w-0">
                                            <h4 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                                {complaint.studentName || t('complaints.unknownStudent')}
                                            </h4>
                                            <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
                                                {complaint.complaintType}{complaint.assessmentTitle ? ` \u00b7 ${complaint.assessmentTitle}` : ""}
                                            </p>
                                        </div>
                                        <span className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeCls(complaint.status)}`}>
                                            {complaint.status === "pending" && <ClockIcon size={12} />}
                                            {complaint.status === "resolved" && <CheckIcon size={12} />}
                                            {complaint.status === "rejected" && <XIcon size={12} />}
                                            {t(`complaints.${complaint.status}`)}
                                        </span>
                                    </div>
                                    <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark line-clamp-2">
                                        {complaint.reason}
                                    </p>
                                    <p className="mt-1.5 text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                        {new Date(complaint.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            )}

            {selectedComplaint && (
                <ModelOverlay onClose={closeDetail} maxWidth="max-w-2xl">
                    <div className="relative z-50 w-full rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28)] flex flex-col max-h-[80vh]">
                        <div className="shrink-0 flex items-center justify-between gap-4 border-b border-border-primary-default-light px-3 sm:px-6 py-4 dark:border-border-primary-default-dark">
                            <div className="min-w-0 truncate">
                                <h3 className="text-xl font-semibold truncate text-text-primary-default-light dark:text-text-primary-default-dark">
                                    {t('complaints.complaintDetail')}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={closeDetail}
                                className="rounded-lg border border-border-primary-default-light bg-bg-surface-secondary-default-light p-2 text-icon-secondary-default-light transition-colors hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-icon-secondary-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
                            >
                                <XIcon size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-5">
                            <div className="flex items-center gap-3">
                                <div className={`p-2.5 rounded-lg shrink-0 ${COMPLAINT_TYPE_CLS[selectedComplaint.complaintType] || "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark"}`}>
                                    {COMPLAINT_TYPE_ICON[selectedComplaint.complaintType] || <ExclamationIcon size={18} />}
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                        {selectedComplaint.studentName || "Unknown Student"}
                                    </p>
                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                        {selectedComplaint.complaintType}{selectedComplaint.assessmentTitle ? ` \u00b7 ${selectedComplaint.assessmentTitle}` : ""}
                                    </p>
                                </div>
                                <span className={`ms-auto shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadgeCls(selectedComplaint.status)}`}>
                                    {selectedComplaint.status === "pending" && <ClockIcon size={12} />}
                                    {selectedComplaint.status === "resolved" && <CheckIcon size={12} />}
                                    {selectedComplaint.status === "rejected" && <XIcon size={12} />}
                                    {selectedComplaint.status}
                                </span>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wide">
                                    {t('complaints.reason')}
                                </label>
                                <p className="mt-1.5 text-sm text-text-primary-default-light dark:text-text-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-xl p-4">
                                    {selectedComplaint.reason}
                                </p>
                            </div>

                            {selectedComplaint.createdAt && (
                                <div>
                                    <label className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wide">
                                        {t('complaints.submitted')}
                                    </label>
                                    <p className="mt-1 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                        {new Date(selectedComplaint.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                    </p>
                                </div>
                            )}

                            <div>
                                <label className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wide">
                                    {t('complaints.yourResponse')}
                                </label>
                                <TextArea
                                    value={responseText}
                                    onChange={(event) => setResponseText(event.target.value)}
                                    placeholder={selectedComplaint.status === "pending" ? t('complaints.responsePlaceholder') : t('complaints.updateResponsePlaceholder')}
                                    className="mt-1.5 w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-light outline-none transition-colors placeholder:text-text-secondary-default-light focus:border-border-accent-default-light focus:ring-4 focus:ring-accent-500/10 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-dark dark:placeholder:text-text-secondary-default-dark"
                                />
                            </div>
                        </div>

                        <div className="shrink-0 flex gap-3 border-t border-border-primary-default-light px-3 sm:px-6 py-4 sm:justify-end dark:border-border-primary-default-dark">
                            <Button variant="secondary" type="button" onClick={closeDetail} width="flex-1 sm:w-auto">
                                {t('complaints.cancel')}
                            </Button>
                            {selectedComplaint.status === "pending" && (
                                <>
                                    <Button
                                        variant="danger"
                                        type="button"
                                        width="flex-1 sm:w-auto"
                                        onClick={handleReject}
                                        loading={respondMutation.isPending}
                                        disabled={respondMutation.isPending}
                                    >
                                        {t('complaints.reject')}
                                    </Button>
                                    <Button
                                        variant="success"
                                        type="button"
                                        width="flex-1 sm:w-auto"
                                        onClick={handleResolve}
                                        loading={respondMutation.isPending}
                                        disabled={respondMutation.isPending}
                                    >
                                        {t('complaints.resolve')}
                                    </Button>
                                </>
                            )}
                            {(selectedComplaint.status === "resolved" || selectedComplaint.status === "rejected") && (
                                <Button
                                    variant="primary"
                                    type="button"
                                    width="flex-1 sm:w-auto"
                                    onClick={handleUpdateResponse}
                                    loading={respondMutation.isPending}
                                    disabled={respondMutation.isPending}
                                >
                                    {t('complaints.updateResponse')}
                                </Button>
                            )}
                        </div>
                    </div>
                </ModelOverlay>
            )}
        </div>
    );
}
