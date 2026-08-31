import { useState } from "react";
import { addMonths, subMonths } from "date-fns";

import CalendarHeader from "./calendar/CalendarHeader";
import CalendarDays from "./calendar/CalendarDays";
import CalendarCells from "./calendar/CalendarCells";

export default function CalendarWidget({ selectedDate: selectedDateProp, onDateSelect, className = "" }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [internalSelectedDate, setInternalSelectedDate] = useState(new Date());
    const selectedDate = selectedDateProp || internalSelectedDate;

    const handleDateSelect = (date) => {
        setInternalSelectedDate(date);
        onDateSelect?.(date);
    };

    return (
        <div className={`bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-8 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark ${className}`}>
            <CalendarHeader
                currentMonth={currentMonth}
                onPrev={() => setCurrentMonth(subMonths(currentMonth, 1))}
                onNext={() => setCurrentMonth(addMonths(currentMonth, 1))}
            />

            <CalendarDays />

            <CalendarCells
                currentMonth={currentMonth}
                selectedDate={selectedDate}
                setSelectedDate={handleDateSelect}
            />
        </div>
    );
}
