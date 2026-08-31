import { useTranslation } from 'react-i18next';
import useArabicDigits from "../../../../../hooks/useArabicDigits";
import WeeklySchedule, { days } from "../../../../../components/ui/WeeklySchedule";
import WeeklyScheduleAgenda from "../../../../../components/ui/schedule/WeeklyScheduleAgenda.phone";
import PaginationButtons from "../../../../../components/ui/PaginationButtons";
import CourseCard from "../CourseCard";
import CoursesRegistrationActionButtons from "../CourseRegistrationActionButtons";
import CourseRegistrationNote from "../CourseRegistrationNote";
import {
  BookIcon,
  CheckCircleIcon,
  CalendarIcon,
  PlusIcon,
  XIcon,
  ClockIcon,
} from "../../../../../components/ui/icons";

export default function KanbanLayout({
  selectedCourses,
  availableCourses,
  paginatedSelected,
  paginatedAvailable,
  selectedCoursesPage,
  setSelectedCoursesPage,
  availableCoursesPage,
  setAvailableCoursesPage,
  selectedTotalPages,
  availableTotalPages,
  sectionOptionsByCourseId,
  selectedSectionByCourseId,
  schedulePreview,
  schedulePreviewLoading,
  isMobile,
  handleRegister,
  handleUnregister,
  handleConfirmRegistration,
  setSelectedSectionByCourseId,
}) {
  const { t } = useTranslation('student');
  const { convert: ar } = useArabicDigits();
  const selectedCredits = selectedCourses.reduce(
    (s, c) => s + (typeof c.creditHours === "number" ? c.creditHours : 0),
    0
  );

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] gap-4">
      {/* Quick Stats Strip */}
      <div className="flex items-center gap-3 px-1">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark text-xs">
          <CheckCircleIcon className="w-3.5 h-3.5 text-bg-fill-primary-active-light dark:text-bg-fill-primary-active-dark" />
          <span className="text-text-secondary-active-light dark:text-text-secondary-active-dark">
            {ar(t('registration.selectedCount', { count: selectedCourses.length }))}
          </span>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark text-xs">
          <ClockIcon className="w-3.5 h-3.5 text-bg-fill-primary-active-light dark:text-bg-fill-primary-active-dark" />
          <span className="text-text-secondary-active-light dark:text-text-secondary-active-dark">
            {ar(t('registration.creditsCount', { credits: selectedCredits, max: 18 }))}
          </span>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* Available */}
        <div className="flex-1 flex flex-col rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
          {/* Column Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface-secondary-default-light/50 dark:bg-bg-surface-secondary-default-dark/50 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="w-8 h-8 rounded-lg bg-bg-fill-primary-muted-light dark:bg-bg-fill-primary-muted-dark flex items-center justify-center">
              <BookIcon className="w-4 h-4 text-bg-fill-primary-active-light dark:text-bg-fill-primary-active-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
                {t('registration.columnAvailable')}
              </h3>
              <p className="text-xs text-text-secondary-active-light dark:text-text-secondary-active-dark">
                {ar(availableCourses.length)} {t('registration.courses')}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-bg-fill-primary-muted-light dark:bg-bg-fill-primary-muted-dark text-xs font-medium text-bg-fill-primary-active-light dark:text-bg-fill-primary-active-dark">
              {ar(paginatedAvailable.length)} {t('registration.showing')}
            </span>
          </div>

          {/* Cards */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {paginatedAvailable.length > 0 ? (
              paginatedAvailable.map((course) => (
                <div
                  key={course.courseId}
                  className="group relative"
                >
                  <CourseCard
                    course={course}
                    cardType="available"
                    onAction={() => handleRegister(course)}
                  />
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary-active-light dark:text-text-secondary-active-dark">
                <BookIcon className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">{t('registration.noAvailable')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/30 dark:bg-bg-surface-secondary-default-dark/30">
            <PaginationButtons
              totalPages={availableTotalPages}
              currentPage={availableCoursesPage}
              setCurrentPage={setAvailableCoursesPage}
            />
          </div>
        </div>

        {/* Selected */}
        <div className="flex-1 flex flex-col rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
          {/* Column Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-bg-surface-success-default-light/10 dark:bg-bg-surface-success-default-dark/10 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="w-8 h-8 rounded-lg bg-bg-surface-success-default-light dark:bg-bg-surface-success-default-dark flex items-center justify-center">
              <CheckCircleIcon className="w-4 h-4 text-text-success-active-light dark:text-text-success-active-dark" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
                {t('registration.columnSelected')}
              </h3>
              <p className="text-xs text-text-secondary-active-light dark:text-text-secondary-active-dark">
                {ar(selectedCourses.length)} {t('registration.courses')} · {ar(selectedCredits)} {t('registration.creditsWord')}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-md bg-bg-surface-success-default-light dark:bg-bg-surface-success-default-dark text-xs font-medium text-text-success-active-light dark:text-text-success-active-dark">
              {ar(paginatedSelected.length)} {t('registration.showing')}
            </span>
          </div>

          {/* Cards */}
          <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
            {paginatedSelected.length > 0 ? (
              paginatedSelected.map((course) => (
                <div
                  key={course.courseId}
                  className="group relative"
                >
                  <CourseCard
                    course={course}
                    cardType="selected"
                    onAction={() => handleUnregister(course)}
                    sectionOptions={
                      sectionOptionsByCourseId[course.courseId] || []
                    }
                    selectedSection={
                      selectedSectionByCourseId[course.courseId]
                    }
                    onSectionChange={(opt) =>
                      setSelectedSectionByCourseId((prev) => ({
                        ...prev,
                        [course.courseId]: opt,
                      }))
                    }
                  />
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-text-secondary-active-light dark:text-text-secondary-active-dark">
                <CheckCircleIcon className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">{t('registration.noSelected')}</p>
                <p className="text-xs mt-1 opacity-60">
                  {t('registration.pickCourses')}
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/30 dark:bg-bg-surface-secondary-default-dark/30">
            <PaginationButtons
              totalPages={selectedTotalPages}
              currentPage={selectedCoursesPage}
              setCurrentPage={setSelectedCoursesPage}
            />
          </div>
        </div>
      </div>

      {/* Schedule Preview */}
      <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4">
        <div className="flex items-center gap-2 mb-3">
          <CalendarIcon className="w-4 h-4 text-text-secondary-active-light dark:text-text-secondary-active-dark" />
          <h3 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
            {t('registration.schedulePreview')}
          </h3>
        </div>
        {schedulePreviewLoading ? (
          <div className="animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-xl h-40 w-full" />
        ) : isMobile ? (
          <WeeklyScheduleAgenda
            days={days}
            schedule={schedulePreview}
            variant="default"
          />
        ) : (
          <WeeklySchedule schedule={schedulePreview} />
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-1">
        <CoursesRegistrationActionButtons
          onConfirm={handleConfirmRegistration}
        />
        <CourseRegistrationNote />
      </div>
    </div>
  );
}
