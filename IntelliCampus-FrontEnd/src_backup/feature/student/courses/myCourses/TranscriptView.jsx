import { useTranslation } from 'react-i18next';
import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import Section from "../../../../components/ui/Section";
import Button from "../../../../components/ui/Button";
import FilterDropdown from "../../../../components/ui/FilterDropdown";
import { TranscriptSkeleton } from "./SkeletonLoader";
import { fetchTranscript, exportTranscriptPdf } from "../gradeApi";
import { DownloadIcon, FileLinesIcon } from "../../../../components/ui/icons";
import { useError } from '../../../../contexts/ErrorContext.jsx';

export default function TranscriptView() {
    const { t } = useTranslation('student');
    const { data: transcript = [], isLoading: loading } = useQuery({
        queryKey: ["transcript"],
        queryFn: fetchTranscript,
        staleTime: 10 * 60 * 1000,
    });
    const [exporting, setExporting] = useState(false);
    const { showError } = useError();
    const [filterLevel, setFilterLevel] = useState([]);
    const [filterSemester, setFilterSemester] = useState([]);

    const handleExport = async () => {
        setExporting(true);
        try {
            await exportTranscriptPdf();
        } catch (err) {
            showError(err.message);
        } finally {
            setExporting(false);
        }
    };

    const levelOptions = useMemo(() => {
        const levels = new Set(transcript.map(c => c.level).filter(l => l != null));
        return [...levels].sort((a, b) => a - b).map(l => ({ value: String(l), label: `${t('transcript.level')} ${l}` }));
    }, [transcript]);

    const semesterOptions = useMemo(() => {
        const semesters = new Set(transcript.map(c => c.semester).filter(s => s));
        return [...semesters].sort().map(s => ({ value: s, label: s }));
    }, [transcript]);

    const filteredTranscript = useMemo(() => {
        return transcript.filter(c => {
            if (filterLevel.length > 0 && c.level != null && !filterLevel.includes(String(c.level))) return false;
            if (filterLevel.length > 0 && c.level == null) return false;
            if (filterSemester.length > 0 && c.semester && !filterSemester.includes(c.semester)) return false;
            if (filterSemester.length > 0 && !c.semester) return false;
            return true;
        });
    }, [transcript, filterLevel, filterSemester]);

    const totalCredits = filteredTranscript.reduce((sum, c) => sum + (c.creditHours || 0), 0);

    if (loading) {
        return (
            <Section className="p-6">
                <TranscriptSkeleton />
            </Section>
        );
    }

    if (transcript.length === 0) {
        return (
            <Section className="p-6 flex flex-col flex-1">
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                    <FileLinesIcon className="w-12 h-12 mb-4 opacity-40" />
                    <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                        {t('transcript.noData')}
                    </h3>
                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-md">
                        {t('transcript.noDataDesc')}
                    </p>
                </div>
            </Section>
        );
    }

    return (
        <Section className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-sm">
            <div className="p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h2 className="text-lg font-bold text-text-primary-active-light dark:text-text-primary-active-dark">
                        {t('transcript.title')}
                    </h2>
                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t('transcript.totalCredits', { count: totalCredits })}
                    </p>
                </div>
                <div className="flex flex-nowrap items-center gap-2 w-full">
                    {levelOptions.length > 0 && (
                        <FilterDropdown
                            label={t('transcript.level')}
                            className="flex-1"
                            options={levelOptions}
                            selectedValues={filterLevel}
                            onChange={setFilterLevel}
                        />
                    )}
                    {semesterOptions.length > 0 && (
                        <FilterDropdown
                            label={t('transcript.semester')}
                            className="flex-1"
                            options={semesterOptions}
                            selectedValues={filterSemester}
                            onChange={setFilterSemester}
                        />
                    )}
                    <Button
                        variant="primary"
                        size="sm"
                        width="w-full"
                        className="flex-1 shrink"
                        onClick={handleExport}
                        loading={exporting}
                        loadingText={t('transcript.exporting')}
                        startIcon={<DownloadIcon className="w-4 h-4" />}
                    >
                        <span className="hidden sm:inline">{t('transcript.exportPdf')}</span>
                    </Button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark">
                            <th className="text-start px-4 py-3 font-semibold hidden sm:table-cell">{t('transcript.code')}</th>
                            <th className="text-start px-4 py-3 font-semibold">{t('transcript.courseName')}</th>
                            <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">{t('transcript.creditHours')}</th>
                            <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">{t('transcript.level')}</th>
                            <th className="text-center px-4 py-3 font-semibold hidden sm:table-cell">{t('transcript.semester')}</th>
                            <th className="text-center px-4 py-3 font-semibold">{t('transcript.coursework')}</th>
                            <th className="text-center px-4 py-3 font-semibold">{t('transcript.total')}</th>
                            <th className="text-center px-4 py-3 font-semibold">{t('transcript.grade')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTranscript.map((course, idx) => (
                            <tr
                                key={course.courseId || idx}
                                className={`border-t border-border-primary-default-light dark:border-border-primary-default-dark ${
                                    idx % 2 === 0
                                        ? "bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark"
                                        : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark"
                                }`}
                            >
                                <td className="px-4 py-3 text-text-secondary-active-light dark:text-text-secondary-active-dark font-mono text-xs hidden sm:table-cell">
                                    {course.courseCode}
                                </td>
                                <td className="px-4 py-3 text-text-primary-active-light dark:text-text-primary-active-dark font-medium">
                                    {course.courseName}
                                </td>
                                <td className="px-4 py-3 text-center text-text-secondary-active-light dark:text-text-secondary-active-dark hidden sm:table-cell">
                                    {course.creditHours}
                                </td>
                                <td className="px-4 py-3 text-center text-text-secondary-active-light dark:text-text-secondary-active-dark hidden sm:table-cell">
                                    {course.level ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-center text-text-secondary-active-light dark:text-text-secondary-active-dark hidden sm:table-cell">
                                    {course.semester ?? "—"}
                                </td>
                                <td className="px-4 py-3 text-center text-text-secondary-active-light dark:text-text-secondary-active-dark">
                                    {course.coursework}
                                </td>
                                <td className="px-4 py-3 text-center font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
                                    {course.totalGrade}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-bold ${
                                        course.letter === "A" || course.letter === "A+" || course.letter === "A-"
                                            ? "bg-bg-surface-success-default-light dark:bg-bg-surface-success-default-dark text-text-success-default-light dark:text-text-success-default-dark"
                                            : course.letter === "B" || course.letter === "B+" || course.letter === "B-"
                                            ? "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-blue-800 dark:text-blue-200"
                                            : course.letter === "C" || course.letter === "C+" || course.letter === "C-"
                                            ? "bg-bg-surface-warning-default-light dark:bg-bg-surface-warning-default-dark text-yellow-800 dark:text-yellow-200"
                                            : course.letter === "D" || course.letter === "D+"
                                            ? "bg-bg-surface-warning-default-light dark:bg-bg-surface-warning-default-dark text-orange-800 dark:text-orange-200"
                                            : course.letter === "F"
                                            ? "bg-bg-surface-danger-default-light dark:bg-bg-surface-danger-default-dark text-red-800 dark:text-red-200"
                                            : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark"
                                    }`}>
                                        {course.letter}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Section>
    );
}
