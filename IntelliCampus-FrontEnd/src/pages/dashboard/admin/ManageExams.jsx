import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import PageHeader from "../../../components/ui/PageHeader";
import Button from "../../../components/ui/Button";
import Section from "../../../components/ui/Section";
import Dialog from "../../../components/ui/Dialog";
import ImportDialog from "../../../components/ui/ImportDialog";
import { ArrowRotateRightIcon, CalendarCheckIcon, DownloadIcon, ImportIcon } from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { uploadExams } from "../../../feature/admin/services/adminSchedulingApi";
import ExamScheduler from "../../../feature/admin/components/ExamScheduler";

function downloadCSV(data, filename) {
    if (!data || data.length === 0) return;
    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];
    for (const row of data) {
        csvRows.push(headers.map(h => {
            const v = row[h];
            const s = String(v ?? "");
            return s.includes(",") || s.includes('"') || s.includes("\n")
                ? `"${s.replace(/"/g, '""')}"` : s;
        }).join(","));
    }
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

export default function ManageExams() {
    const { t } = useTranslation('admin');
    const { isPhone } = useDeviceType();
    const { showError } = useError();
    const schedulerRef = useRef(null);

    const examTypeOptions = useMemo(() => [
        { value: "", label: t('manageExams.fromFileColumn') },
        { value: "Midterm", label: t('manageExams.midterm') },
        { value: "Final", label: t('manageExams.final') },
    ], [t]);
    const [hasSchedule, setHasSchedule] = useState(false);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [confirmReset, setConfirmReset] = useState(false);
    const [result, setResult] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [selectedExamType, setSelectedExamType] = useState(examTypeOptions[0]);

    useEffect(() => {
        setSelectedExamType((prev) => examTypeOptions.find((o) => o.value === prev?.value) || examTypeOptions[0]);
    }, [examTypeOptions]);

    const handleImport = async (file) => {
        setIsUploading(true);
        try {
            const examType = selectedExamType.value || null;
            const res = await uploadExams(file, examType);
            setResult(res);
            if (res.failCount > 0) {
                const msg = [
                    t('manageExams.importResult', { successCount: res.successCount, failCount: res.failCount }),
                    ...res.errors.slice(0, 20),
                ].join("\n");
                showError(msg);
            } else {
                setSuccessMessage(t('manageExams.importSuccess', { count: res.successCount }));
            }
        } catch (err) {
            showError(err.message);
        } finally {
            setIsUploading(false);
            setIsImportOpen(false);
        }
    };

    const handleExport = useCallback(() => {
        const data = schedulerRef.current?.getScheduleData?.();
        if (data && data.length > 0) {
            downloadCSV(data, `exam-schedule-${new Date().toISOString().split("T")[0]}.csv`);
        }
    }, []);

    return (
        <>
            <PageHeader title={t('manageExams.title')} subtitle={t('manageExams.subtitle')}>
                <div className="flex items-center gap-2">
                    <Button variant="primary" onClick={() => schedulerRef.current?.handleAuto?.()}>
                        <CalendarCheckIcon size={24} />
                        {!isPhone && t('manageExams.autoSchedule')}
                    </Button>
                    {hasSchedule && (
                        <Button variant="secondary" onClick={() => setConfirmReset(true)}>
                            <ArrowRotateRightIcon size={24} />
                            {!isPhone && t('manageExams.reset')}
                        </Button>
                    )}
                    <Button variant="secondary" onClick={handleExport} disabled={!hasSchedule}>
                        <DownloadIcon size={24} />
                        {!isPhone && t('manageExams.exportExcel')}
                    </Button>
                    <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
                        <ImportIcon size={24} />
                        {!isPhone && t('manageExams.importExams')}
                    </Button>
                </div>
            </PageHeader>

            <Section>
                <ExamScheduler ref={schedulerRef} onScheduleChange={setHasSchedule} />
            </Section>

            {result && (
                <Section>
                    <div className="flex items-center gap-4 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        <span className="text-text-success-default-light dark:text-text-success-default-dark">
                            {t('manageExams.lastImport', { succeeded: result.successCount })}
                        </span>
                        {result.failCount > 0 && (
                            <span className="text-text-danger-default-light dark:text-text-danger-default-dark">
                                {t('manageExams.failed', { failed: result.failCount })}
                            </span>
                        )}
                        <span>{t('manageExams.total', { total: result.totalRows })}</span>
                    </div>
                </Section>
            )}

            <Dialog
                isOpen={confirmReset}
                variant="warning"
                title={t('manageExams.resetConfirmTitle')}
                confirmText={t('manageExams.yesReset')}
                cancelText={t('manageExams.cancel')}
                onClose={() => setConfirmReset(false)}
                onConfirm={() => { schedulerRef.current?.handleReset?.(); setConfirmReset(false); }}
            >
                {t('manageExams.resetConfirmMessage')}
            </Dialog>

            <Dialog
                isOpen={successMessage !== null}
                variant="success"
                title={t('manageExams.successTitle')}
                onClose={() => setSuccessMessage(null)}
                confirmText={t('manageExams.ok')}
                showCloseButton={true}
            >
                {successMessage}
            </Dialog>

            {isImportOpen && (
                <ImportDialog
                    title={t('manageExams.importTitle')}
                    subtitle={t('manageExams.importSubtitle')}
                    onClose={() => setIsImportOpen(false)}
                    onImport={handleImport}
                >
                    <div>
                        <label className="block text-sm font-medium mb-2 text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('manageExams.examTypeOverride')}
                        </label>
                        <select
                            value={selectedExamType.value}
                            onChange={(e) => {
                                const match = examTypeOptions.find(o => o.value === e.target.value);
                                setSelectedExamType(match || examTypeOptions[0]);
                            }}
                            className="w-full rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark px-3 py-2 bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-sm"
                        >
                            {examTypeOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-1.5">
                            {selectedExamType.value
                                ? t('manageExams.overrideDescription', { type: selectedExamType.label })
                                : t('manageExams.useColumnDescription')}
                        </p>
                    </div>
                </ImportDialog>
            )}
        </>
    );
}
