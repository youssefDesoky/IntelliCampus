    import { useTranslation } from 'react-i18next';
    import PageHeader from "../../../../components/ui/PageHeader";
    import SearchBar from "../../../../components/ui/SearchBar";

    export default function CoursePrerequisitesHeader({ isMobile, search, onSearchChange }) {
        const { t } = useTranslation('student');
        return (
            <PageHeader
                title={t('prerequisites.title')}
                subtitle={t('prerequisites.subtitle')}
                headerDir={isMobile ? "col" : "row"}
            >
                <SearchBar placeholder={t('prerequisites.searchPlaceholder')} value={search} onChange={(e) => onSearchChange(e.target.value)} />
            </PageHeader>
        );
    }
