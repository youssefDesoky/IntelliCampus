import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import useDeviceType from "../../../hooks/useDeviceType";

import WeeklySchedule, { days } from "../../../components/ui/WeeklySchedule";
import WeeklyScheduleAgenda from "../../../components/ui/schedule/WeeklyScheduleAgenda.phone";
import ScheduleHeader from "../../../feature/student/schedule/ScheduleHeader";
import { ScheduleSkeleton } from "../../../feature/student/schedule/SkeletonLoader";
import { fetchMySchedule, exportSchedulePdf } from "../../../feature/instructor/schedule/scheduleApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

const allowedTypeFilters = ["lecture", "section", "activity"];

export default function InstructorSchedule() {
    const { t } = useTranslation('instructor');
    const [selectedTypes, setSelectedTypes] = useState([]);
    const { isMobile } = useDeviceType();
    const { showError } = useError();

    const {
        data: scheduleData = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["instructorSchedule"],
        queryFn: fetchMySchedule,
        staleTime: 5 * 60 * 1000,
    });

    useEffect(() => {
        if (error) showError(error.message || "Failed to load schedule");
    }, [error, showError]);

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
            await exportSchedulePdf(selectedTypes);
        } catch {
            showError(t('schedule.exportError'));
        }
    };

    const filteredSchedule = selectedTypes.length === 0
        ? scheduleData
        : scheduleData.filter((event) => selectedTypes.includes(getTypeGroup(event.type)));

    if (isLoading) {
        return <ScheduleSkeleton isMobile={isMobile} />;
    }

    return (
        <>        
            <ScheduleHeader
                currSchedule="weekly"
                isMobile={isMobile}
                selectedTypes={selectedTypes}
                onToggleType={toggleTypeFilter}
                onClearTypes={clearTypeFilters}
                onExport={handleExport}
                hideToggle
            />

            {isMobile ? (
                <WeeklyScheduleAgenda
                    days={days}
                    schedule={filteredSchedule}
                    variant="default"
                    onEventClick={(event) => showError(t('schedule.eventClick', { title: event.title }))}
                />
            ) : (
                <WeeklySchedule
                    schedule={filteredSchedule}
                    isMobile={isMobile}
                    onEventClick={(event) => showError(t('schedule.eventClick', { title: event.title }))}
                />
            )}
        </>
    );
}
