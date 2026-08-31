import { useTranslation } from 'react-i18next';
import TranscriptView from "../../../feature/student/courses/myCourses/TranscriptView";
import PageHeader from "../../../components/ui/PageHeader";

export default function TranscriptPage() {
    const { t } = useTranslation('student');
    return (
        <div className="flex flex-col min-h-[calc(100vh-160px)]">
            <PageHeader title={t('transcript.title')} subtitle={t('transcript.subtitle')} />
            <TranscriptView />
        </div>
    );
}
