import { useTranslation } from 'react-i18next';
import PageHeader from "../../../../components/ui/PageHeader";
import ToggleViewMode from "../../../../components/ui/ToggleViewMode";
import FilterDropdown from "../../../../components/ui/FilterDropdown";
import SearchBar from "../../../../components/ui/SearchBar";
import { Grid2ColIcon, ListIcon } from "../../../../components/ui/icons";

export default function MyCoursesHeader({
    isMobile,
    viewMode,
    setViewMode,
    filterStatus,
    setFilterStatus,
    filterType,
    setFilterType,
    searchQuery,
    setSearchQuery,
    hasCourses,
}) {
    const { t } = useTranslation('student');

    return (
        <PageHeader title={t('myCourses.title')} subtitle={t('myCourses.subtitle')} headerDir="col" className="sm:flex-row sm:items-center">
            {hasCourses && (
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
                <SearchBar
                    placeholder={t('myCourses.search')}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full sm:w-44 md:w-52"
                />
                <FilterDropdown
                    label={t('myCourses.status')}
                    className="flex-1 sm:flex-none sm:w-auto"
                    dropdownAlign="left"
                    options={[
                        { value: "in-progress", label: t('myCourses.inProgressDisplay') },
                        { value: "completed", label: t('myCourses.completed') },
                    ]}
                    selectedValues={filterStatus}
                    onChange={setFilterStatus}
                />
                <FilterDropdown
                    label={t('myCourses.type')}
                    className="flex-1 sm:flex-none sm:w-auto"
                    dropdownAlign="right"
                    options={[
                        { value: "mandatory", label: t('myCourses.mandatory') },
                        { value: "elective", label: t('myCourses.elective') },
                    ]}
                    selectedValues={filterType}
                    onChange={setFilterType}
                />

                {!isMobile && (
                    <>
                        <ToggleViewMode
                            isVertical={false}
                            isFirstMode={viewMode === "grid"}
                            onFirstModeSelect={() => setViewMode("grid")}
                            onSecondModeSelect={() => setViewMode("list")}
                            firstModeLabel={<Grid2ColIcon className="w-5 h-5" />}
                            secondModeLabel={<ListIcon className="w-5 h-5" />}
                        />
                        <div className="h-6 w-px bg-border-primary-default-light dark:bg-border-primary-default-dark" />
                    </>
                )}
            </div>
            )}
        </PageHeader>
    );
}