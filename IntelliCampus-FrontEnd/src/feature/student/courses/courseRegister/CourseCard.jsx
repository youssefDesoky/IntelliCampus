import { useTranslation, Trans } from 'react-i18next';
import SelectBox from "../../../../components/ui/SelectBox";

import { getLocalizedField } from '../../../../utils/getLocalizedField';
import { 
    CalendarIcon, 
    LocationDotIcon, 
    LockIconDark , 
    PlusIcon, 
    XIcon,
    UserIcon,
    WarningIcon,
} from "../../../../components/ui/icons";

function getInitials(name) {
    if (!name) return "?";
    return name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .slice(0, 2)
        .join("")
        .toUpperCase();
}

export default function CourseCard({
    course,
    index,
    cardType = "disabled",
    onAction,
    sectionOptions = [],
    selectedSection,
    onSectionChange,
    conflicts = [],
    isPendingRemoval = false,
}) {
    const { t, i18n } = useTranslation('student');

    const formatPrerequisite = (prereq) => {
        if (typeof prereq === "string") return prereq;
        if (typeof prereq === "object" && prereq !== null) {
            return getLocalizedField(prereq, 'courseName', i18n.language) ?? getLocalizedField(prereq, 'name', i18n.language) ?? prereq.title ?? prereq.courseCode ?? prereq.code ?? prereq.id ?? JSON.stringify(prereq);
        }
        return String(prereq);
    };
    return(
        <div className={`course-card flex flex-col gap-3 p-4 border rounded-lg shadow-sm shadow-shadow-light hover:shadow-md dark:shadow-shadow-dark transition-opacity ${
            isPendingRemoval
                ? 'border-border-danger-default-light dark:border-border-danger-default-dark bg-bg-surface-danger-default-light/10 dark:bg-bg-surface-danger-default-dark/10 opacity-60'
                : 'border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark'
        }`}>
            {/* Top row: avatar + course info + credits */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    {/* Avatar */}
                    {course.avatar ? (
                        <img
                            src={course.avatar}
                            alt={course.professor}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark flex items-center justify-center text-white text-sm font-bold shrink-0">
                            {getInitials(course.professor)}
                        </div>
                    )}

                        <div className="flex flex-col min-w-0">
                            {/* Course code */}
                            <div className="flex items-center gap-1.5">
                                <span className="text-sm font-semibold text-text-secondary-active-light dark:text-text-secondary-active-dark">
                                    {course.code}
                                </span>
                                <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                                    course.isElective
                                        ? 'bg-bg-fill-warning-default-light dark:bg-bg-fill-warning-default-dark text-white'
                                        : 'bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white'
                                }`}>
                                    {course.isElective ? t('registration.elective', 'Elective') : t('registration.required', 'Required')}
                                </span>
                            </div>
                            {/* Course title */}
                            <h3 className="font-semibold text-base text-text-primary-active-light dark:text-text-primary-active-dark truncate">
                                {course.title}
                            </h3>
                        </div>
                </div>

                {/* Credits */}
                <div className="flex items-center gap-2 shrink-0">
                    {isPendingRemoval && (
                        <span className="text-xs font-semibold text-text-danger-default-light dark:text-text-danger-default-dark">
                            {t('registration.pendingRemoval', { defaultValue: 'Removing' })}
                        </span>
                    )}
                    <span className="text-sm font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark">
                        {course.creditHours} {t('registration.creditAbbr')}
                    </span>
                </div>
            </div>

            {/* Middle info: professor, schedule, room */}
            <div className="flex flex-col gap-1 ps-[52px]">
                <div className="flex items-center gap-2 text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">
                    <UserIcon className="w-4 h-4 text-icon-primary-default-light dark:text-icon-primary-default-dark shrink-0" />
                    <span className="truncate">{course.professor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">
                    <CalendarIcon className="w-4 h-4 text-icon-primary-default-light dark:text-icon-primary-default-dark shrink-0" />
                    <span className="truncate">{course.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">
                    <LocationDotIcon className="w-4 h-4 text-icon-primary-default-light dark:text-icon-primary-default-dark shrink-0" />
                    <span className="truncate">{course.room}</span>
                </div>
            </div>

            {/* Bottom row: prerequisites / section dropdown + action button */}
            <div className="pt-3 flex items-center gap-3 border-t border-t-border-primary-default-light dark:border-t-border-primary-default-dark">
                { cardType === "selected" ? (
                    <>
                        {course.isProject ? (
                            <span className="flex-1 text-xs font-semibold text-text-accent-default-light dark:text-text-accent-default-dark">
                                Project Course — No sections required
                            </span>
                        ) : sectionOptions.length > 0 ? (
                            <SelectBox
                                className="flex-1"
                                label=""
                                options={sectionOptions}
                                selectedOption={selectedSection}
                                onChange={onSectionChange}
                                yPadding="py-1.5"
                                compact={true}
                                showLabel={false}
                            />
                        ) : (
                            <span className="text-xs text-text-secondary-active-light dark:text-text-secondary-active-dark flex-1">
                                {t('registration.noSections')}
                            </span>
                        )}
                        <button
                            onClick={onAction}
                            className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-md border transition-colors ${
                                isPendingRemoval
                                    ? 'border-text-danger-default-light dark:border-text-danger-default-dark text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-bg-surface-secondary-hover-light dark:hover:bg-bg-surface-secondary-hover-dark'
                                    : 'border-border-primary-default-light dark:border-border-primary-default-dark text-text-secondary-active-light dark:text-text-secondary-active-dark hover:bg-bg-surface-secondary-hover-light dark:hover:bg-bg-surface-secondary-hover-dark hover:text-text-danger-active-light dark:hover:text-text-danger-active-dark'
                            }`}
                            aria-label={isPendingRemoval ? t('registration.undoRemove') || 'Undo' : t('registration.removeCourse')}
                        >
                            {isPendingRemoval ? (
                                <span className="text-xs font-bold">&#x21A9;</span>
                            ) : (
                                <XIcon className="w-4 h-4" />
                            )}
                        </button>
                    </>
                ) : cardType === "available" ? (
                    <>
                        <p className="text-xs text-text-secondary-active-light dark:text-text-secondary-active-dark flex-1">
                            {course.isProject ? (
                                <span className="font-semibold text-text-accent-default-light dark:text-text-accent-default-dark">Project Course</span>
                            ) : course.preRequisites && course.preRequisites.length > 0 ? (
                                course.preRequisites.map((coursePreReq, index) => (
                                    <span key={index}>
                                        {formatPrerequisite(coursePreReq)}{index < course.preRequisites.length - 1 && " - "}
                                    </span>
                                ))
                            ) : t('registration.noPrerequisites')}
                        </p>
                        <button
                            onClick={onAction}
                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-bg-fill-primary-active-light dark:bg-bg-fill-primary-active-dark text-white hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors"
                            aria-label={t('registration.addCourse')}
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <>
                        <p className="text-xs text-text-secondary-active-light dark:text-text-secondary-active-dark flex-1">
                            {course.isProject ? (
                                <span className="font-semibold text-text-accent-default-light dark:text-text-accent-default-dark">Project Course</span>
                            ) : course.preRequisites && course.preRequisites.length > 0 ? (
                                course.preRequisites.map((coursePreReq, index) => (
                                    <span key={index}>
                                        {formatPrerequisite(coursePreReq)}{index < course.preRequisites.length - 1 && " - "}
                                    </span>
                                ))
                            ) : t('registration.noPrerequisites')}
                        </p>
                        <div className="shrink-0 w-8 h-8 flex items-center justify-center">
                            <LockIconDark className="w-5 h-5 text-text-secondary-active-light dark:text-text-secondary-active-dark" />
                        </div>
                    </>
                )}
            </div>

            {conflicts.length > 0 && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-md bg-bg-surface-danger-default-light/60 dark:bg-bg-surface-danger-default-dark/60 border border-border-danger-default-light dark:border-border-danger-default-dark">
                    <WarningIcon className="w-4 h-4 text-text-danger-default-light dark:text-text-danger-default-dark shrink-0 mt-0.5" />
                    <div className="text-xs text-text-danger-default-light dark:text-text-danger-default-dark">
                        {conflicts.map((c, i) => (
                            <p key={i}>
                                <Trans t={t} i18nKey="registration.conflictsWith" values={{ type: c.type, conflictWith: c.conflictWith, day: c.day, time: c.time }} components={{ strong: <strong /> }} />
                            </p>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
