import { useTranslation } from "react-i18next";
import Button from "../../../../../components/ui/Button";
import { exportGraph } from "./communityService";
import { useError } from '../../../../../contexts/ErrorContext.jsx';

export default function CommunityQuickActions({ courseId, className = "" }) {
    const { t } = useTranslation('student');
    const { showError } = useError();
    const handleExportGraph = async () => {
        try {
            const gexf = await exportGraph(courseId);
            const blob = new Blob([gexf], { type: "application/xml" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `course_${courseId}_graph.gexf`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            showError(err.message);
        }
    };

    return (
        <div className={`p-4 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark ${className}`}>
            <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-3">
                {t('community.quickActions')}
            </h3>
            <div className="space-y-2">
                <Button variant="secondary" size="sm" className="w-full" onClick={handleExportGraph}>
                    {t('community.exportGraph')}
                </Button>
            </div>
        </div>
    );
}