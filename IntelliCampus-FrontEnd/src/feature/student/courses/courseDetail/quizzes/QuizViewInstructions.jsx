import { useTranslation } from 'react-i18next';
import ModelOverlay from "../../../../../components/ui/ModelOverlay";
import Button from "../../../../../components/ui/Button";
import { XIcon, ClockIcon, InfoIcon, CalendarDaysIcon, BrainIcon } from "../../../../../components/ui/icons";

export default function QuizViewInstructions({ quiz, onClose }) {
    const { t } = useTranslation('student');
    return (
        <ModelOverlay onClose={onClose} maxWidth="max-w-2xl">
            <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
                <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <InfoIcon size={20} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('quizzes.instructionsTitle')}
                            </h2>
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {/* TODO: i18n - backend returns English only */}
                            {quiz.title}
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
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {quiz.deadline && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <CalendarDaysIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                <div>
                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.deadline')}</p>
                                    <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{quiz.deadline}</p>
                                </div>
                            </div>
                        )}
                        {quiz.duration && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <ClockIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                <div>
                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.duration')}</p>
                                    <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{quiz.duration}</p>
                                </div>
                            </div>
                        )}
                        {quiz.totalQuestions && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <BrainIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                <div>
                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.questions')}</p>
                                    <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{quiz.totalQuestions}</p>
                                </div>
                            </div>
                        )}
                        {quiz.totalPoints && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <BrainIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                <div>
                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.totalPoints')}</p>
                                    <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{quiz.totalPoints}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {quiz.description && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('quizzes.description')}
                            </h3>
                            <div className="p-4 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark leading-relaxed">
                                    {quiz.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {quiz.instructions && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('quizzes.instructions')}
                            </h3>
                            <div className="p-4 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark leading-relaxed whitespace-pre-wrap">
                                    {quiz.instructions}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-end p-5 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                    <Button variant="secondary" onClick={onClose}>
                        {t('quizzes.close')}
                    </Button>
                </div>
            </div>
        </ModelOverlay>
    );
}
