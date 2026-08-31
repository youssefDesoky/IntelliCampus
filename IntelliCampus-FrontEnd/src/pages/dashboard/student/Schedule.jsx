import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import useDeviceType from "../../../hooks/useDeviceType";

import WeeklySchedule, { days } from "../../../components/ui/WeeklySchedule";
import WeeklyScheduleAgenda from "../../../components/ui/schedule/WeeklyScheduleAgenda.phone";
import ScheduleHeader from "../../../feature/student/schedule/ScheduleHeader";
import ExamSchedule from "../../../feature/student/schedule/ExamSchedule";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import { fetchMySchedule, exportSchedulePdf } from "../../../feature/student/schedule/scheduleApi";
import { ScheduleSkeleton, ExamScheduleSkeleton } from "../../../feature/student/schedule/SkeletonLoader";
import { fetchMyExams, exportExamSchedulePdf } from "../../../feature/student/schedule/examScheduleApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import useArabicDigits from "../../../hooks/useArabicDigits";
import { getLocalizedField } from "../../../utils/getLocalizedField";

const scheduleStorageKey = "studentCurrSchedule";
const allowedTypeFilters = ["lecture", "section", "activity"];

export default function Schedule() {
    const { t, i18n } = useTranslation('student');
    const [currSchedule, setCurrSchedule] = useState(localStorage.getItem(scheduleStorageKey) || "weekly");
    const [selectedTypes, setSelectedTypes] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const { isMobile } = useDeviceType();
    const { showError } = useError();

    const isWeekly = currSchedule === "weekly";

    const { data: scheduleData = [], isLoading: scheduleLoading } = useQuery({
        queryKey: ["studentSchedule"],
        queryFn: async () => {
            try { return await fetchMySchedule(); } catch { return []; }
        },
        enabled: isWeekly,
        staleTime: 5 * 60 * 1000,
    });

    const { data: examsData = [], isLoading: examsLoading } = useQuery({
        queryKey: ["studentExams"],
        queryFn: async () => {
            try { return await fetchMyExams(); } catch { return []; }
        },
        enabled: !isWeekly,
        staleTime: 5 * 60 * 1000,
    });

    const getTypeGroup = (eventType) => {
        if (eventType === "lecture") return "lecture";
        if (eventType === "section") return "section";
        return "activity";
    };

    const toggleTypeFilter = (type) => {
        if (!allowedTypeFilters.includes(type)) return;

        setSelectedTypes((prev) => {
            if (prev.includes(type)) {
                return prev.filter((item) => item !== type);
            }

            return [...prev, type];
        });
    };

    const clearTypeFilters = () => setSelectedTypes([]);

    const handleExport = async () => {
        try {
            if (isWeekly) {
                await exportSchedulePdf(selectedTypes);
            } else {
                await exportExamSchedulePdf();
            }
        } catch {
            showError(t('schedule.exportFailed'));
        }
    };

    const filteredSchedule = selectedTypes.length === 0
        ? scheduleData
        : scheduleData.filter((event) => selectedTypes.includes(getTypeGroup(event.type)));

    if (scheduleLoading && isWeekly) {
        return <ScheduleSkeleton isMobile={isMobile} />;
    }

    if (examsLoading && !isWeekly) {
        return <ExamScheduleSkeleton />;
    }

    return (
        <>        
            <ScheduleHeader
                currSchedule={currSchedule}
                setCurrSchedule={setCurrSchedule}
                isMobile={isMobile}
                selectedTypes={selectedTypes}
                onToggleType={toggleTypeFilter}
                onClearTypes={clearTypeFilters}
                onExport={handleExport}
            />

            {isWeekly ? (
                isMobile ? (
                    <WeeklyScheduleAgenda
                        days={days}
                        schedule={filteredSchedule}
                        variant="default"
                        onEventClick={setSelectedEvent}
                    />
                ) : (
                    <WeeklySchedule
                        schedule={filteredSchedule}
                        onEventClick={setSelectedEvent}
                    />
                )
            ) : (
                <ExamSchedule exams={examsData} />
            )}

            {selectedEvent && (
                <EventDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
            )}
        </>
    );
}

function EventDetailModal({ event, onClose }) {
    const { t, i18n } = useTranslation("common");
    const { localizeTime } = useArabicDigits();
    const localizedTitle = getLocalizedField(event, 'title', i18n.language);
    const type = event.type?.toLowerCase();

    const getTypeLabel = (type) => {
        if (type === "lecture") return t("schedule.typeLecture");
        if (type === "section") return t("schedule.typeSection");
        if (type === "activity") return t("schedule.typeActivity");
        return type?.toUpperCase() || "";
    };

    const accentGradient = type === "lecture"
        ? "bg-linear-to-r from-bg-fill-accent-default-light to-text-blue-accent-light"
        : type === "section"
        ? "bg-linear-to-r from-text-purple-accent-light to-border-purple-default-dark"
        : "bg-linear-to-r from-text-primary-default-light to-icon-primary-default-light";

    const bgColorClass = type === "lecture"
        ? "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-accent-light dark:text-text-blue-accent-dark"
        : type === "section"
        ? "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark"
        : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark";

    const badgeClass = type === "lecture"
        ? "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-accent-light dark:text-text-blue-accent-dark"
        : type === "section"
        ? "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark"
        : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark";

    const dayName = event.day ? t(`days.${event.day}`) : "";

    return (
        <ModelOverlay onClose={onClose}>
            <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-2xl shadow-2xl max-w-md w-full mx-auto overflow-hidden">
                <div className={`h-2 ${accentGradient}`} />

                <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-3">
                            <div className={`w-12 h-12 flex items-center justify-center rounded-xl ${bgColorClass}`}>
                                <span className="text-2xl font-bold uppercase">
                                    {localizedTitle?.[0] || "?"}
                                </span>
                            </div>
                            <div>
                                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${badgeClass}`}>
                                    {getTypeLabel(event.type).toUpperCase()}
                                </span>
                                <h3 className="text-xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark mt-1">
                                    {localizedTitle}
                                </h3>
                            </div>
                        </div>
                        <button
                            className="p-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark hover:text-text-primary-hover-light dark:hover:text-text-primary-hover-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg transition"
                            onClick={onClose}
                            aria-label={t('schedule.close')}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-xl">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg">
                                <svg className="w-5 h-5 text-icon-accent-default-light dark:text-icon-accent-default-dark" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7a2 2 0 002 2z"/>
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">{t('schedule.dateTime')}</p>
                                <p className="font-medium text-text-primary-active-light dark:text-text-primary-active-dark">
                                    {dayName} &bull; {localizeTime(event.startTime)} - {localizeTime(event.endTime)}
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
                                    <p className="text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">{t('schedule.location')}</p>
                                    <p className="font-medium text-text-primary-active-light dark:text-text-primary-active-dark">{getLocalizedField(event, 'location', i18n.language)}</p>
                                </div>
                            </div>
                        )}

                        {getLocalizedField(event, 'instructor', i18n.language) && (
                            <div className="flex items-center gap-3 p-3 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg transition">
                                <div className="p-2 bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark rounded-lg">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                    </svg>
                                </div>
                                <div>
                                    <p className="text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">{t('schedule.instructor')}</p>
                                    <p className="font-medium text-text-primary-active-light dark:text-text-primary-active-dark">{getLocalizedField(event, 'instructor', i18n.language)}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ModelOverlay>
    );
}
