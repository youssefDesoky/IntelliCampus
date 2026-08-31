import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import InputItem from "../../../components/form/InputItem";
import NumberInput from "../../../components/form/NumberInput";
import TimeInput from "../../../components/form/TimeInput";
import SelectBox from "../../../components/ui/SelectBox";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import { PlusIcon, XIcon } from "../../../components/ui/icons";
import {
    fetchLectureInstructors,
    fetchSectionInstructors,
    fetchLectureRooms,
    fetchSectionRooms,
} from "../services/adminCoursesApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

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

export default function ClassForm({ onClose, onSubmit, initialData = null, isOpen = true, courseDepartment = "", classType }) {
    const { t } = useTranslation('admin');
    const { showError } = useError();
    const isEdit = !!initialData;

    const [instructorOptions, setInstructorOptions] = useState([]);
    const [selectedInstructor, setSelectedInstructor] = useState(null);

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
                    label: `${r.roomName}${r.type ? ` (${r.type})` : ""}${r.capacity ? ` - Cap: ${r.capacity}` : ""}`,
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

    const handleSubmit = (e) => {
        e.preventDefault();

        const room = selectedRoom?.value || "";
        if (!room) { showError(t('classForm.errorRoomRequired')); return; }
        if (!selectedInstructor) { showError(t('classForm.errorInstructorRequired')); return; }

        const validSlots = scheduleSlots.filter((s) => s.day && s.time);
        if (validSlots.length === 0) { showError(t('classForm.errorSlotRequired')); return; }

        const payloads = validSlots.map((slot) => {
            const base = {
                schedule: `${slot.day} ${slot.time.padStart(5, "0") + ":00"}`,
                room: selectedRoom?.label?.split(" (")[0] || selectedRoom?.roomName || "",
            };
            if (isEdit) {
                base.instructorId = selectedInstructor?.value;
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
        >
            <div className="space-y-5 mb-6">
                {/* Row 1: Instructor */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
