import { useTranslation } from "react-i18next";
import ModelOverlay from "../../../../../components/ui/ModelOverlay";
import Button from "../../../../../components/ui/Button";
import { XIcon, ChartBarIcon, StarIcon, UserIcon, ClockIcon } from "../../../../../components/ui/icons";
import useArabicDigits from "../../../../../hooks/useArabicDigits";

export default function ViewGrade({ assignment, onClose }) {
    const { t } = useTranslation('student');
    const { convert: ar } = useArabicDigits();
    const totalPoints = assignment.totalPoints || 100;
    const pointsEarned = assignment.score || 0;
    const pct = totalPoints ? Math.round((pointsEarned / totalPoints) * 100) : 0;

    return (
        <ModelOverlay onClose={onClose} maxWidth="max-w-lg">
            <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
                <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                            <ChartBarIcon size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('viewGrade.title')}
                            </h2>
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {/* TODO: i18n - backend returns English only */}
                                {assignment.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    <div className="flex flex-col items-center justify-center py-4 gap-3">
                        <div className="relative w-28 h-28">
                            <svg className="w-full h-full" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-gray-200 dark:text-gray-700" strokeWidth="8" />
                                <circle cx="60" cy="60" r="54" fill="none" stroke="currentColor" className="text-green-500 dark:text-green-400" strokeWidth="8" strokeDasharray={`${(pct / 100) * 339.292} 339.292`} strokeLinecap="round" transform="rotate(-90 60 60)" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-3xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                                    {ar(pct)}%
                                </span>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            <span className="font-semibold text-green-600 dark:text-green-400">{ar(pointsEarned)}</span>
                            {" / "}
                            <span>{ar(totalPoints)}</span> {t('viewGrade.points')}
                        </p>
                    </div>

                    {assignment.feedback && (
                        <div className="space-y-3">
                            <div className="flex justify-between gap-2">
                                <div className="flex flex-row items-center gap-1">
                                    <StarIcon size={16} className="text-amber-500" />
                                    <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                        {t('viewGrade.instructorFeedback')}
                                    </h3>
                                </div>

                                <div className="flex items-center gap-2 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                    <ClockIcon size={14} />
                                    <span>{t('viewGrade.gradedOn', { date: assignment.gradedDate })}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/30">
                                    <UserIcon size={16} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                        {t('viewGrade.gradedBy')}
                                    </p>
                                    <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                        {assignment.gradedBy}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark leading-relaxed">
                                    {assignment.feedback}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModelOverlay>
    );
}
