import { useTranslation } from 'react-i18next';
import { ArrowRightIcon, BookIcon, CheckIcon } from "../../../../components/ui/icons";

const typeStyles = {
  elective: {
    labelKey: 'myCourses.electiveLabel',
    badge: "bg-bg-surface-purple-default-light text-text-purple-default-light border-border-purple-default-light dark:bg-bg-surface-purple-default-dark dark:text-text-purple-default-dark dark:border-border-purple-default-dark",
  },
  mandatory: {
    labelKey: 'myCourses.mandatoryLabel',
    badge: "bg-bg-surface-blue-default-light text-text-blue-default-light border-border-blue-default-light dark:bg-bg-surface-blue-default-dark dark:text-text-blue-default-dark dark:border-border-blue-default-dark",
  },
};

export default function CoursePrerequisitesCard({ course = {} }) {
    const { t } = useTranslation('student');
    // Explicit safe fallbacks
    const {
        code = "TBD",
        creditHours = 0,
        title = t('prerequisites.untitledCourse'),
        isElective = false,
        prerequisites = []
    } = course;

    const type = isElective ? "elective" : "mandatory";
    const typeAccent = typeStyles[type];

    const safePrerequisites = Array.isArray(prerequisites) ? prerequisites : [];
    const hasPrerequisites = safePrerequisites.length > 0;

    return (
        <article className="group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border-primary-default-light bg-bg-surface-primary-default-light shadow-sm transition-shadow duration-300 hover:shadow-md motion-safe:transition-transform motion-safe:hover:-translate-y-0.5 dark:border-border-primary-default-dark dark:bg-bg-surface-primary-default-dark">

            {/* Header */}
            <header className="flex items-start justify-between gap-4 px-6 pt-6 pb-5">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <h2 className="font-mono text-2xl font-black uppercase tracking-tight text-text-primary-default-light dark:text-text-primary-default-dark">
                            {code}
                        </h2>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border leading-none ${typeAccent.badge}`}>
                            {t(typeAccent.labelKey)}
                        </span>
                    </div>
                    <h3
                        className="mt-1.5 text-base font-semibold leading-snug text-text-secondary-default-light line-clamp-2 transition-colors group-hover:text-text-accent-default-light dark:text-text-secondary-default-dark dark:group-hover:text-text-accent-default-dark"
                        title={title}
                    >
                        {title}
                    </h3>
                </div>

                {/* Credit stamp */}
                <div
                    className="grid h-14 w-14 shrink-0 -rotate-6 place-items-center rounded-full border-2 border-dashed border-text-accent-default-light/60 dark:border-text-accent-default-dark/60"
                    aria-hidden="true"
                >
                    <span className="text-center font-mono text-[10px] font-bold uppercase leading-tight text-text-accent-default-light dark:text-text-accent-default-dark">
                        {creditHours}
                        <br />
                        {t('prerequisites.creditAbbr')}
                    </span>
                </div>
            </header>

            <div className="border-t border-dashed border-border-primary-default-light/70 dark:border-border-primary-default-dark/70" />

            {/* Body */}
            <div className="flex flex-1 flex-col gap-3 px-6 py-5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    <BookIcon size={14} aria-hidden="true" className="shrink-0 text-text-accent-default-light dark:text-text-accent-default-dark" />
                    <span>{t('prerequisites.label')}</span>
                </div>

                {hasPrerequisites ? (
                    <div
                        className="mt-auto flex flex-wrap items-center gap-2"
                        role="list"
                        aria-label={t('prerequisites.ariaLabel', { title })}
                    >
                        {safePrerequisites.map((prereq, index) => {
                            const prereqId = prereq?.id || `fallback-id-${index}`;
                            const prereqTitle = prereq?.title || t('prerequisites.untitledPrerequisite');
                            const isLast = index === safePrerequisites.length - 1;

                            return (
                                <div key={prereqId} className="flex items-center gap-2" role="listitem">
                                        <div className="flex max-w-[9rem] flex-col rounded-lg border border-border-primary-default-light/70 bg-bg-surface-secondary-default-light px-3 py-2 transition-colors hover:border-text-accent-default-light/60 dark:border-border-primary-default-dark/70 dark:bg-bg-surface-secondary-default-dark dark:hover:border-text-accent-default-dark/60">
                                        <span className="font-mono text-[10px] font-bold uppercase tracking-wide text-text-accent-default-light dark:text-text-accent-default-dark">
                                            {prereqId}
                                        </span>
                                        <span
                                            className="truncate text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark"
                                            title={prereqTitle}
                                        >
                                            {prereqTitle}
                                        </span>
                                    </div>
                                    {!isLast && (
                                        <span
                                            className="text-sm font-bold text-text-secondary-default-light/50 dark:text-text-secondary-default-dark/50"
                                            aria-hidden="true"
                                        >
                                            +
                                        </span>
                                    )}
                                </div>
                            );
                        })}

                        <div className="flex items-center gap-2">
                            <ArrowRightIcon
                                size={14}
                                aria-hidden="true"
                                className="shrink-0 text-text-secondary-default-light/50 dark:text-text-secondary-default-dark/50 rtl:scale-x-[-1]"
                            />
                            <span className="inline-flex items-center gap-1.5 rounded-lg bg-bg-fill-primary-active-light px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide text-white dark:bg-bg-fill-primary-active-dark">
                                <CheckIcon size={12} aria-hidden="true" />
                                {t('prerequisites.thisCourse')}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="mt-auto flex items-center gap-2.5 rounded-lg border border-dashed border-border-primary-default-light/60 bg-bg-surface-secondary-default-light/40 px-3.5 py-3 dark:border-border-primary-default-dark/60 dark:bg-bg-surface-secondary-default-dark/40">
                        <CheckIcon size={16} className="shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                        <span className="text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('prerequisites.openEnrollment')}
                        </span>
                    </div>
                )}
            </div>
        </article>
    );
}