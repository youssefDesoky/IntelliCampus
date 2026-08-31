import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import InputItem from "../../../components/form/InputItem";
import NumberInput from "../../../components/form/NumberInput";
import TimeInput from "../../../components/form/TimeInput";
import SelectBox from "../../../components/ui/SelectBox";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import { PlusIcon, XIcon, WarningIcon } from "../../../components/ui/icons";
import {
    fetchLectureInstructors,
    fetchSectionInstructors,
    fetchLectureRooms,
    fetchSectionRooms,
} from "../services/adminCoursesApi";
import { fetchInstructorSchedule } from "../services/adminInstructorsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';

const dayOptions = [
    { value: "Sun", label: "Sunday" },
    { value: "Mon", label: "Monday" },
    { value: "Tue", label: "Tuesday" },
    { value: "Wed", label: "Wednesday" },
    { value: "Thu", label: "Thursday" },
    { value: "Fri", label: "Friday" },
    { value: "Sat", label: "Saturday" },
];

function parseSchedule(schedule) {
    if (!schedule) return [];
    return schedule.split(",").map((s) => {
        const trimmed = s.trim();
        const spaceIdx = trimmed.indexOf(" ");
        if (spaceIdx === -1) return { day: trimmed, time: "" };
        const rawTime = trimmed.slice(spaceIdx + 1);
        const match = rawTime.match(/(\d{1,2}:\d{2})/);
        return { day: trimmed.slice(0, spaceIdx), time: match ? match[1] : rawTime };
    }).filter((s) => s.day);
}

/* ── Time helpers (shared with CoursesRegistration) ── */
function parseTimeToMinutes(timeStr) {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
}

function normalizeDay(day) {
    if (!day) return '';
    return day.toLowerCase().slice(0, 3);
}

function isOverlapping(a, b) {
    const dayA = normalizeDay(a.day ?? a.dayName ?? '');
    const dayB = normalizeDay(b.day ?? b.dayName ?? '');
    if (dayA !== dayB) return false;
    const sA = parseTimeToMinutes(a.startTime ?? a.time ?? '');
    const eA = parseTimeToMinutes(a.endTime ?? '');
    const sB = parseTimeToMinutes(b.startTime ?? b.time ?? '');
    const eB = parseTimeToMinutes(b.endTime ?? '');
    return sA < eB && sB < eA;
}

function formatHourMin(timeStr) {
    if (!timeStr) return '';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;
    const h = parseInt(parts[0], 10);
    const m = parts[1];
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m} ${ampm}`;
}

export default function ClassForm({ onClose, onSubmit, initialData = null, isOpen = true, courseDepartment = "", classType }) {
    const { t, i18n } = useTranslation('admin');
    const { showError } = useError();
    const isEdit = !!initialData;

    const [instructorOptions, setInstructorOptions] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState(null);

    const [instructorSchedule, setInstructorSchedule] = useState([]);
    const [scheduleConflict, setScheduleConflict] = useState(null);
    const [checkingSchedule, setCheckingSchedule] = useState(false);

    const [scheduleSlots, setScheduleSlots] = useState(() => {
        const parsed = parseSchedule(initialData?.schedule);
        return parsed.length > 0 ? parsed : [{ day: "Sun", time: "" }];
    });

    const [roomOptions, setRoomOptions] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);

    const [capacity, setCapacity] = useState(initialData?.capacity ?? "");

    const maxSlots = isEdit ? 1 : (classType === "Section" ? 1 : 2);

    useEffect(() => {
        async function loadData() {
            try {
                const isLecture = classType === "Lecture";
                const [instructorsData, roomsData] = await Promise.all([
                    isLecture ? fetchLectureInstructors() : fetchSectionInstructors(),
                    isLecture ? fetchLectureRooms() : fetchSectionRooms(),
                ]);

                const instList = Array.isArray(instructorsData) ? instructorsData : [];
                const instOpts = instList.map((i) => ({
                    value: i.instructorId,
                    label: i.fullName,
                    instructorId: i.instructorId,
                    role: i.instructorRole,
                    departmentName: i.departmentName || "",
                }));
                setInstructorOptions(instOpts);

                let matchedInstructor = null;
                if (initialData?.instructorId != null) {
                    matchedInstructor = instOpts.find((o) => o.value === initialData.instructorId);
                } else if (initialData?.instructor) {
                    matchedInstructor = instOpts.find((o) => o.label === initialData.instructor);
                }
                if (!matchedInstructor && instOpts.length > 0) {
                    matchedInstructor = instOpts[0];
                }
                setSelectedInstructor(matchedInstructor);

                const roomList = Array.isArray(roomsData) ? roomsData : [];
                const roomOpts = roomList.map((r) => ({
                    value: r.roomId,
                    label: `${getLocalizedField(r, 'roomName', i18n.language) || r.roomName}${r.type ? ` (${r.type})` : ""}${r.capacity ? ` - Cap: ${r.capacity}` : ""}`,
                    roomId: r.roomId,
                    roomType: r.type,
                }));
                setRoomOptions(roomOpts);

                let matchedRoom = null;
                if (initialData?.roomId != null) {
                    matchedRoom = roomOpts.find((o) => o.value === initialData.roomId);
                } else if (initialData?.room && roomOpts.length > 0) {
                    matchedRoom = roomOpts.find((o) => o.label.includes(initialData.room));
                }
                if (!matchedRoom && roomOpts.length > 0) {
                    matchedRoom = roomOpts[0];
                }
                setSelectedRoom(matchedRoom);
            } catch { /* silently ignored */ }
        }
        loadData();
    }, [classType, initialData]);

    /* ── Fetch instructor schedule on instructor change ── */
    useEffect(() => {
        if (!selectedInstructor?.value) {
            setInstructorSchedule([]);
            return;
        }
        let cancelled = false;
        setCheckingSchedule(true);
        fetchInstructorSchedule(selectedInstructor.value)
            .then((data) => {
                if (!cancelled) {
                    setInstructorSchedule(Array.isArray(data) ? data : []);
                    setCheckingSchedule(false);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setInstructorSchedule([]);
                    setCheckingSchedule(false);
                }
            });
        return () => { cancelled = true; };
    }, [selectedInstructor?.value]);

    /* ── Re-check conflict whenever schedule slots or instructor schedule changes ── */
    useEffect(() => {
        if (!selectedInstructor || scheduleSlots.length === 0) {
            setScheduleConflict(null);
            return;
        }
        const conflict = detectInstructorConflict(scheduleSlots, instructorSchedule, isEdit ? initialData._classId : null);
        setScheduleConflict(conflict);
    }, [scheduleSlots, instructorSchedule, selectedInstructor]);

    function detectInstructorConflict(slots, existingSchedule, excludeClassId) {
        for (const slot of slots) {
            if (!slot.day || !slot.time) continue;
            const startMinutes = parseTimeToMinutes(slot.time);
            const endMinutes = startMinutes + 90;
            const slotStart = `${String(Math.floor(startMinutes / 60)).padStart(2, '0')}:${String(startMinutes % 60).padStart(2, '0')}:00`;
            const slotEnd = `${String(Math.floor(endMinutes / 60)).padStart(2, '0')}:${String(endMinutes % 60).padStart(2, '0')}:00`;
            for (const event of existingSchedule) {
                if (excludeClassId != null && event.scheduleId === excludeClassId) continue;
                if (isOverlapping(
                    { day: slot.day, startTime: slotStart, endTime: slotEnd },
                    { dayName: event.dayName ?? event.day, startTime: event.startTime, endTime: event.endTime }
                )) {
                    const eventEnd = event.endTime ? formatHourMin(event.endTime) : '';
                    return {
                        day: slot.day,
                        time: formatHourMin(slot.time),
                        conflictWith: event.courseName ?? event.title ?? 'Another class',
                    };
                }
            }
        }
        return null;
    }

    const handleSubmit = (e) => {
        e.preventDefault();

        if (scheduleConflict) {
            showError(`Cannot save: ${scheduleConflict.conflictWith} already has a class on ${scheduleConflict.day} at ${scheduleConflict.time}.`);
            return;
        }

        const room = selectedRoom?.value || "";
        if (!room) { showError(t('classForm.errorRoomRequired')); return; }
        if (room && !capacity) { showError(t('classForm.errorCapacityRequired') || 'Capacity is required when a room is selected.'); return; }
        if (!selectedInstructor) { showError(t('classForm.errorInstructorRequired')); return; }

        const validSlots = scheduleSlots.filter((s) => s.day && s.time);
        if (validSlots.length === 0) { showError(t('classForm.errorSlotRequired')); return; }

        const payloads = validSlots.map((slot) => {
            const base = {
                schedule: `${slot.day} ${slot.time.padStart(5, "0") + ":00"}`,
                roomId: selectedRoom?.value || null,
            };
            if (isEdit) {
                base.instructorId = selectedInstructor?.value;
                if (capacity) base.capacity = parseInt(capacity);
            } else {
                base.instructorName = selectedInstructor?.label || selectedInstructor?.fullName || "";
                if (capacity) base.capacity = parseInt(capacity);
            }
            return base;
        });

        if (isEdit && payloads.length > 0) {
            onSubmit(payloads[0]);
        } else {
            onSubmit(payloads);
        }
    };

    const updateSlot = (index, field, value) => {
        setScheduleSlots((prev) =>
            prev.map((s, i) => (i === index ? { ...s, [field]: value } : s))
        );
    };

    const addSlot = () => {
        setScheduleSlots((prev) => {
            if (prev.length >= maxSlots) return prev;
            return [...prev, { day: "Sun", time: "" }];
        });
    };

    const removeSlot = (index) => {
        setScheduleSlots((prev) => prev.filter((_, i) => i !== index));
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={isEdit ? t('classForm.title.edit') : classType ? t('classForm.title.add', { type: classType }) : t('classForm.title.addDefault')}
            description={isEdit ? t('classForm.description.edit') : classType ? t('classForm.description.add', { type: classType.toLowerCase() }) : t('classForm.description.addDefault')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={isEdit ? t('classForm.submit.edit') : classType ? t('classForm.submit.add', { type: classType }) : t('classForm.submit.addDefault')}
            submitDisabled={!!scheduleConflict || checkingSchedule}
        >
            <div className="space-y-5 mb-6">
                {/* Row 1: Instructor */}
                <div className="grid grid-cols-1 gap-6">
                    {instructorOptions.length > 0 ? (
                        <SelectBox
                            className="w-full"
                            label={classType === "Lecture" ? t('classForm.professor') : t('classForm.ta')}
                            labelDirection="flex-col"
                            options={instructorOptions}
                            selectedOption={selectedInstructor}
                            onChange={setSelectedInstructor}
                        />
                    ) : (
                        <div className="self-end pb-1">
                            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {courseDepartment
                                    ? t('classForm.noInstructorForDepartment', { type: classType === "Lecture" ? t('classForm.professor').toLowerCase() : t('classForm.ta').toLowerCase(), department: courseDepartment })
                                    : t('classForm.noInstructor', { type: classType === "Lecture" ? t('classForm.professor').toLowerCase() : t('classForm.ta').toLowerCase() })}
                            </p>
                        </div>
                    )}
                </div>

                {/* Row 2: Schedule */}
                <div className="border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl p-4 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                    <div className="flex items-center justify-between mb-3">
                        <label className="font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark">
                            {t('classForm.schedule')}
                        </label>

                        {!isEdit && scheduleSlots.length < maxSlots && (
                            <Button type="button" variant="text" size="sm" onClick={addSlot}>
                                <PlusIcon className="w-4 h-4" />
                                {t('classForm.addDay')}
                            </Button>
                        )}
                    </div>

                    <div className="space-y-2">
                        {scheduleSlots.map((slot, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-2 p-3 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark"
                            >
                                <select
                                    value={slot.day}
                                    onChange={(e) => updateSlot(idx, "day", e.target.value)}
                                    className="px-3 py-2 rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark focus:outline-none text-sm"
                                >
                                    {dayOptions.map((d) => (
                                        <option key={d.value} value={d.value}>{d.label}</option>
                                    ))}
                                </select>

                                <TimeInput
                                    value={slot.time}
                                    onChange={(e) => updateSlot(idx, "time", e.target.value)}
                                    required
                                />

                                {!isEdit && scheduleSlots.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeSlot(idx)}
                                        className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors shrink-0"
                                        title={t('classForm.removeSlot')}
                                    >
                                        <XIcon className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Conflict Warning */}
                {checkingSchedule && (
                    <div className="flex items-center gap-2 text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Checking instructor schedule...
                    </div>
                )}
                {scheduleConflict && (
                    <div className="flex items-start gap-3 p-4 rounded-lg bg-bg-surface-warning-default-light dark:bg-bg-surface-warning-default-dark border border-border-warning-default-light dark:border-border-warning-default-dark">
                        <WarningIcon className="w-5 h-5 text-text-warning-default-light dark:text-text-warning-default-dark shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-text-warning-default-light dark:text-text-warning-default-dark">
                            Instructor already has a class at this time on <strong>{scheduleConflict.day}</strong> at <strong>{scheduleConflict.time}</strong> ({scheduleConflict.conflictWith})
                        </p>
                    </div>
                )}

                {/* Row 3: Room */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectBox
                        className="w-full"
                        label={t('classForm.room')}
                        labelDirection="flex-col"
                        options={roomOptions}
                        selectedOption={selectedRoom}
                        onChange={setSelectedRoom}
                    />

                    <NumberInput
                        label={t('classForm.capacity')}
                        name="capacity"
                        placeholder={t('classForm.capacityPlaceholder')}
                        value={capacity}
                        onChange={(e) => setCapacity(e.target.value)}
                        min="1"
                        required
                    />
                </div>
            </div>
        </BaseFormComponent>
    );
}
