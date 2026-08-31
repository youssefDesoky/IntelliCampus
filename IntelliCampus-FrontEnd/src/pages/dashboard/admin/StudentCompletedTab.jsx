import { useTranslation } from 'react-i18next';
import { useMemo } from "react";
import Table from "../../../components/ui/Table";
import PaginationButtons from "../../../components/ui/PaginationButtons";
import useDeviceType from "../../../hooks/useDeviceType";
import { getLocalizedField } from '../../../utils/getLocalizedField';
import useArabicDigits from '../../../hooks/useArabicDigits';
import { TabTableSkeleton } from "../../../feature/admin/shared/SkeletonLoader";

function toGradeLetter(p) {
    if (p === null || p === undefined) return "—";
    const n = Number(p);
    if (Number.isNaN(n)) return "—";
    if (n >= 90) return "A";
    if (n >= 80) return "B";
    if (n >= 70) return "C";
    if (n >= 60) return "D";
    return "F";
}

export default function StudentCompletedTab({ courses, loading, page, totalPages, setPage }) {
    const { t, i18n } = useTranslation('admin');
    const { convert: ar } = useArabicDigits();
    const { isPhone } = useDeviceType();

    const headers = useMemo(() => {
        if (isPhone) return [t('studentDetails.course'), t('studentDetails.totalGrade'), t('studentDetails.grade')];
        return [t('studentDetails.code'), t('studentDetails.course'), t('studentDetails.creditHours'), t('studentDetails.courseWork'), t('studentDetails.totalGrade'), t('studentDetails.grade')];
    }, [isPhone, t]);

    const buildRow = useMemo(() => (c) => {
        const row = {};
        if (!isPhone) {
            row.code = c.code || getLocalizedField(c, 'courseCode', i18n.language) || "—";
        }
        row.course = c.title || c.name || getLocalizedField(c, 'courseName', i18n.language) || "—";
        if (!isPhone) {
            row.creditHours = ar(c.creditHours ?? "—");
        }
        if (!isPhone) {
            row.courseWork = c.courseWork != null ? ar(Math.round(Number(c.courseWork))) : "—";
        }
        const totalGrade = c.totalGrade != null ? Number(c.totalGrade) : null;
        const letterGrade = c.grade || (totalGrade != null ? toGradeLetter(totalGrade) : null);
        const gradeColor =
            letterGrade === "A" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300" :
            letterGrade === "B" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300" :
            letterGrade === "C" ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300" :
            "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
        row.percentage = totalGrade != null ? ar(Math.round(totalGrade)) : "—";
        row.grade = (
            <span className={`px-2 py-0.5 rounded font-semibold text-xs ${gradeColor}`}>
                {letterGrade}
            </span>
        );
        return row;
    }, [isPhone, ar]);

    const paginated = courses.slice((page - 1) * 10, page * 10);

    if (loading) {
        return <TabTableSkeleton rows={5} />;
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-12 rounded-lg border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                {t('studentDetails.noCompleted')}
            </div>
        );
    }

    return (
        <>
            <Table
                role="course"
                headers={headers}
                data={paginated.map(buildRow)}
                columnAlignments={isPhone ? ["text-start", "text-center", "text-center"] : ["text-start", "text-start", "text-center", "text-center", "text-center", "text-center"]}
                wrapInSection={false}
                showHeaderActions={false}
                showPagination={false}
                showSelectionColumn={false}
                showActionsColumn={false}
            />
            {totalPages > 1 && (
                <div className="mt-4">
                    <PaginationButtons totalPages={totalPages} currentPage={page} setCurrentPage={setPage} />
                </div>
            )}
        </>
    );
}
