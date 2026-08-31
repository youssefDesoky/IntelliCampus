import { useState } from "react";
import { useTranslation } from 'react-i18next';
import ModelOverlay from "../ModelOverlay";
import { LocationDotIcon, UserTieIcon } from "../icons";
import useArabicDigits from "../../../hooks/useArabicDigits";
import { getLocalizedField } from "../../../utils/getLocalizedField";


const getTimeIndex = (time) => {
    const [hourStr, period] = time.split(" ");
    const [hourPart, minutePart] = hourStr.split(":");
    let hour = parseInt(hourPart);
    const minutes = parseInt(minutePart) || 0;
    
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    
    // Convert minutes to decimal (30 min = 0.5, 15 min = 0.25, etc.)
    const minuteDecimal = minutes / 60;
    
    return (hour - 8) + minuteDecimal; // 8 AM is index 0
};

const getColSpan = (startTime, endTime) => {
    const startIndex = getTimeIndex(startTime);
    const endIndex = getTimeIndex(endTime);
    return endIndex - startIndex;
};

const eventColors = {
    lecture: "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark border-border-blue-default-light dark:border-border-blue-default-dark text-text-blue-default-light dark:text-text-blue-default-dark",
    section: "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark border-border-purple-default-light dark:border-border-purple-default-dark text-text-purple-default-light dark:text-text-purple-default-dark",
    default: "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark border-border-primary-default-light dark:border-border-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark",
};
export default function WeeklyScheduleEvent({ event, rangeStart = 0, totalDuration = 12, columnIndex = 0, columnCount = 1 }) {
    const { t, i18n } = useTranslation('common');
    const { localizeTime } = useArabicDigits();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const localizedTitle = getLocalizedField(event, 'title', i18n.language);
    const instructorName = getLocalizedField(event, 'instructor', i18n.language) ?? getLocalizedField(event, 'instructorName', i18n.language);
    const startIndex = getTimeIndex(event.startTime);
    const colSpan = getColSpan(event.startTime, event.endTime);
    const leftPercent = totalDuration > 0 ? ((startIndex - rangeStart) / totalDuration) * 100 : 0;
    const widthPercent = totalDuration > 0 ? (colSpan / totalDuration) * 100 : 0;
    const adjustedWidth = widthPercent / columnCount;
    const adjustedLeft = leftPercent + (columnIndex * adjustedWidth);
    const colorClass = eventColors[event.type] || eventColors.default;

    const getTypeLabel = (type) => {
        if (type === "lecture") return t("schedule.typeLecture");
        if (type === "section") return t("schedule.typeSection");
        if (type === "activity") return t("schedule.typeActivity");
        return type?.toUpperCase() || "";
    };

    return (
        <>
            <div
                className={`absolute top-1 bottom-1 rounded-lg border-s-4 p-2 transition-all hover:shadow-md hover:scale-[1.02] ${colorClass}`}
                style={{
                    left: `calc(${adjustedLeft}% + 2px)`,
                    width: `calc(${adjustedWidth}% - 4px)`,
                }}
                onClick={() => setIsModalOpen(true)}
                title={`${localizedTitle} - ${localizeTime(event.startTime)} to ${localizeTime(event.endTime)}`}
            >
                <div className="flex flex-col h-full overflow-hidden">
                    <h4 className="font-semibold text-sm truncate">{localizedTitle}</h4>
                    {getLocalizedField(event, 'location', i18n.language) && (
                        <p className="text-xs opacity-75 truncate mt-0.5">
                            <LocationDotIcon className="inline-block w-3 h-3 me-1" />
                            {getLocalizedField(event, 'location', i18n.language)}
                        </p>
                    )}
                    {instructorName && (
                        <p className="text-xs opacity-75 truncate">
                            <UserTieIcon className="inline-block w-3 h-3 me-1" />
                            {instructorName}
                        </p>
                    )}
                </div>
            </div>
            {isModalOpen && (
                <ModelOverlay onClose={() => setIsModalOpen(false)}>
                    <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
                        {/* Header with colored accent */}
                        <div className={`h-2 ${event.type === "lecture" ? "bg-linear-to-r from-bg-fill-accent-default-light to-text-blue-accent-light" : event.type === "section" ? "bg-linear-to-r from-text-purple-accent-light to-border-purple-default-dark" : "bg-linear-to-r from-text-primary-default-light to-icon-primary-default-light"}`} />
                        
                        <div className="p-6">
                            {/* Header with close button */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${event.type === "lecture" ? "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-accent-light dark:text-text-blue-accent-dark" : event.type === "section" ? "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark" : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark"}`}>
                                        <span className="text-2xl font-bold uppercase">
                                            {localizedTitle?.[0] || "?"}
                                        </span>
                                    </div>
                                    <div>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${event.type === "lecture" ? "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-accent-light dark:text-text-blue-accent-dark" : event.type === "section" ? "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark" : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark"}`}>
                                            {getTypeLabel(event.type).toUpperCase()}
                                        </span>
                                        <h3 className="text-xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark mt-1">{localizedTitle}</h3>
                                    </div>
                                </div>
                                <button
                                    className="p-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark hover:text-text-primary-hover-light dark:hover:text-text-primary-hover-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg transition"
                                    onClick={() => setIsModalOpen(false)}
                                    aria-label={t('close')}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                                    </svg>
                                </button>
                            </div>

                            {/* Date and Time Section */}
                            <div className="mb-6 p-4 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-xl">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="p-2 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg">
                                        <svg className="w-5 h-5 text-icon-accent-default-light dark:text-icon-accent-default-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7a2 2 0 002 2z"/>
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">{t('labels.dateAndTime', 'Date & Time')}</p>
                                        <p className="font-medium text-text-primary-active-light dark:text-text-primary-active-dark">
                                            {t(`days.${event.day}`)} • {localizeTime(event.startTime)} - {localizeTime(event.endTime)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-4 mb-6">
                                {getLocalizedField(event, 'location', i18n.language) && (
                                    <div className="flex items-center gap-3 p-3 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg transition">
                                        <div className="p-2 bg-bg-surface-success-disabled-light dark:bg-bg-surface-success-default-dark text-text-success-default-light dark:text-text-success-default-dark rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">{t('labels.location', 'Location')}</p>
                                            <p className="font-medium text-text-primary-active-light dark:text-text-primary-active-dark">{getLocalizedField(event, 'location', i18n.language)}</p>
                                            {event.building && (
                                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('labels.building', 'Building')} {event.building}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {instructorName && (
                                    <div className="flex items-center gap-3 p-3 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg transition">
                                        <div className="p-2 bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark rounded-lg">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">{t('schedule.instructor', 'Instructor')}</p>
                                            <p className="font-medium text-text-primary-active-light dark:text-text-primary-active-dark">{instructorName}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </ModelOverlay>
            )}
        </>
    );
}