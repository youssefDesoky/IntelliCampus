import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { addDays, subDays, isSameDay, startOfDay, format } from "date-fns";

import Categories from "../../../feature/student/reminders/Categories";
import RemindersHeader from "../../../feature/student/reminders/RemindersHeader";
import Timeline from "../../../feature/student/reminders/Timeline";
import CalenderWidget from "../../../components/ui/CalendarWidget";
import AddReminderForm from "../../../feature/student/reminders/AddReminderForm";
import { RemindersSkeleton } from "../../../feature/student/reminders/SkeletonLoader";
import { fetchRemindersByDay, createReminder as createReminderApi, updateReminder as updateReminderApi, deleteReminder as deleteReminderApi } from "../../../feature/student/remindersApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

export default function Reminders() {
    const { t } = useTranslation('student');
    const { showError } = useError();

const MobileDateStrip = ({ selectedDate, onDateSelect }) => {
    const containerRef = useRef(null);
    const selectedRef = useRef(null);
    const dates = Array.from({ length: 22 }).map((_, i) => addDays(subDays(selectedDate, 7), i));

    useEffect(() => {
        if (selectedRef.current && containerRef.current) {
            const container = containerRef.current;
            const element = selectedRef.current;
            const scrollLeft = element.offsetLeft - (container.clientWidth / 2) + (element.offsetWidth / 2);
            container.scrollTo({ left: scrollLeft, behavior: 'smooth' });
        }
    }, [selectedDate]);

    return (
        <div
            ref={containerRef}
            className="flex overflow-x-auto gap-3 py-2 mb-4 lg:hidden snap-x scroll-smooth [&::-webkit-scrollbar]:hidden"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
            {dates.map(date => {
                const isSelected = isSameDay(date, selectedDate);
                return (
                    <button
                        key={date.toISOString()}
                        ref={isSelected ? selectedRef : null}
                        onClick={() => onDateSelect(date)}
                        className={`flex flex-col items-center justify-center min-w-[70px] h-[85px] rounded-2xl border transition-all snap-center ${
                            isSelected
                                ? 'bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark border-border-accent-default-light dark:border-border-accent-default-dark shadow-md scale-105'
                                : 'bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-surface-secondary-hover-light dark:hover:bg-bg-surface-secondary-hover-dark'
                        }`}
                    >
                        <span className="text-2xl font-semibold leading-none mb-1">{format(date, 'd')}</span>
                        <span className="text-sm font-medium">{format(date, 'EEE')}</span>
                    </button>
                );
            })}
        </div>
    );
};

const categoryOptions = [
    { value: "all", label: t ? t('reminders.allCategories') : "All Categories" },
    { value: "classes", label: t ? t('reminders.categoryClasses') : "Classes" },
    { value: "exams", label: t ? t('reminders.categoryExams') : "Exams" },
    { value: "assignments", label: t ? t('reminders.categoryAssignments') : "Assignments" },
    { value: "personal", label: t ? t('reminders.categoryPersonal') : "Personal" },
];
    const queryClient = useQueryClient();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState(categoryOptions[0]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const dateStr = format(selectedDate, "yyyy-MM-dd");

    const {
        data: reminders = [],
        isLoading,
    } = useQuery({
        queryKey: ["reminders", dateStr],
        queryFn: () => fetchRemindersByDay(selectedDate),
        staleTime: 0,
    });

    const createMutation = useMutation({
        mutationFn: createReminderApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            setIsFormOpen(false);
        },
        onError: (err) => showError(err.message),
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => updateReminderApi(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
            setEditingReminder(null);
            setIsFormOpen(false);
        },
        onError: (err) => showError(err.message),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteReminderApi(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reminders"] });
        },
        onError: (err) => showError(err.message),
    });

    const handleSetIsFormOpen = (isOpen) => {
        if (isOpen) setEditingReminder(null);
        setIsFormOpen(isOpen);
    };

    const handleAddReminder = (reminder) => {
        createMutation.mutate(reminder);
    };

    const handleSaveReminder = (updatedReminder) => {
        updateMutation.mutate({ id: updatedReminder.id, data: updatedReminder });
    };

    const handleEditReminder = (reminder) => {
        setEditingReminder(reminder);
        setIsFormOpen(true);
    };

    const handleDeleteReminder = (reminderToDelete) => {
        deleteMutation.mutate(reminderToDelete.id);
    };

    const getReminderDay = (reminderDate) => startOfDay(new Date(reminderDate));
    const selectedDay = startOfDay(selectedDate);
    const nextDay = addDays(selectedDay, 1);
    const weekEnd = addDays(selectedDay, 7);

    const isInSelectedWeek = (reminderDate) => {
        const reminderDay = getReminderDay(reminderDate);
        return reminderDay >= selectedDay && reminderDay <= weekEnd;
    };

    const visibleReminders = reminders.filter((reminder) => {
        const isCategoryMatch = selectedCategory?.value === "all" || reminder.category === selectedCategory?.value;
        return isCategoryMatch && isInSelectedWeek(reminder.dueAt);
    });

    const groupedReminders = {
        selectedDay: visibleReminders.filter((reminder) => isSameDay(new Date(reminder.dueAt), selectedDay)),
        nextDay: visibleReminders.filter((reminder) => isSameDay(new Date(reminder.dueAt), nextDay)),
        week: visibleReminders.filter((reminder) => {
            const reminderDay = getReminderDay(reminder.dueAt);
            return reminderDay > nextDay && reminderDay <= weekEnd;
        }),
    };

    if (isLoading) {
        return <RemindersSkeleton />;
    }

    return (
        <div className="flex flex-col min-h-[calc(100vh-160px)]">
            <RemindersHeader setIsFormOpen={handleSetIsFormOpen} selectedCategory={selectedCategory} onSelectCategory={setSelectedCategory} reminders={reminders} />

            {/* Mobile Date Ribbon */}
            <MobileDateStrip selectedDate={selectedDate} onDateSelect={setSelectedDate} />

            <div className="grid grid-cols-1 lg:grid-cols-4 grid-rows-1 gap-4 flex-1 min-h-0">
                <Timeline
                    className="lg:col-span-3 h-full !mb-0"
                    reminders={groupedReminders}
                    selectedCategory={selectedCategory}
                    selectedDate={selectedDate}
                    onEditReminder={handleEditReminder}
                    onDeleteReminder={handleDeleteReminder}
                />

                <div className="flex flex-col gap-4 h-full">
                    {/* Desktop Calendar Widget */}
                    <div className="hidden lg:flex flex-col flex-1">
                        <CalenderWidget selectedDate={selectedDate} onDateSelect={setSelectedDate} className="h-full" />
                    </div>
                    <div className="hidden lg:flex flex-col flex-1">
                        <Categories
                            className="h-full !mb-0"
                            reminders={reminders}
                            selectedCategory={selectedCategory}
                            onSelectCategory={setSelectedCategory}
                        />
                    </div>
                </div>
            </div>

            {isFormOpen && (
                <AddReminderForm
                    setIsFormOpen={setIsFormOpen}
                    onAddReminder={handleAddReminder}
                    onSaveReminder={handleSaveReminder}
                    initialReminder={editingReminder}
                />
            )}
        </div>
    );
}