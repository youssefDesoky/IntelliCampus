import { useTranslation } from "react-i18next";
import PageHeader from "../../../../components/ui/PageHeader";
import ToggleViewMode from "../../../../components/ui/ToggleViewMode";
import { Grid2ColIcon, ListIcon } from "../../../../components/ui/icons";

export default function InstructorCoursesHeader({isMobile, viewMode, setViewMode, hasCourses}) {
    const { t } = useTranslation('instructor');
    return (
        <PageHeader title={t('courses.title')} subtitle={t('courses.subtitle')}>
            {!isMobile && hasCourses &&
                <ToggleViewMode
                    isVertical={false}
                    isFirstMode={viewMode === "grid"}
                    onFirstModeSelect={() => setViewMode("grid")}
                    onSecondModeSelect={() => setViewMode("list")}
                    firstModeLabel={<Grid2ColIcon className="w-5 h-5" />}
                    secondModeLabel={<ListIcon className="w-5 h-5" />}
                />
            }
        </PageHeader>
    );
}
