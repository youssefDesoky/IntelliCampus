import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import InputItem from "../../../components/form/InputItem";
import SelectBox from "../../../components/ui/SelectBox";
import Button from "../../../components/ui/Button";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import { XIcon } from "../../../components/ui/icons";
import { fetchRoomTypes } from "../services/adminFacilitiesApi";
import { fetchFaculties } from "../services/adminInstructorsApi";

const capacityOptions = [
    { value: "20", label: "Up to 20" },
    { value: "40", label: "Up to 40" },
    { value: "60", label: "Up to 60" },
    { value: "100", label: "Up to 100" },
    { value: "150", label: "Up to 150" },
    { value: "200", label: "Up to 200" },
];

export default function RoomForm({ onClose, onSubmit, initialData = {}, isLoading = false, isOpen = true }) {
    const { t } = useTranslation('admin');
    const isEdit = !!(initialData.id ?? initialData.roomId);
    const [roomTypes, setRoomTypes] = useState([]);

    useEffect(() => {
        fetchRoomTypes()
            .then(setRoomTypes)
            .catch(() => {});
    }, []);

    const [selectedType, setSelectedType] = useState(null);

    useEffect(() => {
        if (roomTypes.length) {
            if (initialData.type) {
                setSelectedType(roomTypes.find(t => t.value === initialData.type) || roomTypes[0]);
            } else {
                setSelectedType(roomTypes[0]);
            }
        }
    }, [roomTypes, initialData.type]);

    const [faculties, setFaculties] = useState([]);

    useEffect(() => {
        fetchFaculties()
            .then(data => {
                const list = Array.isArray(data) ? data : (data?.data ?? []);
                setFaculties(list);
            })
            .catch(() => {});
    }, []);

    const facultyOptions = useMemo(() => {
        return faculties.map(f => ({ value: f.facultyId ?? f.id, label: f.facultyName ?? f.name, labelAr: f.facultyNameAr ?? f.nameAr }));
    }, [faculties]);

    const [selectedFaculty, setSelectedFaculty] = useState(() => {
        if (initialData.facultyId) {
            return facultyOptions.find(f => f.value === initialData.facultyId) || facultyOptions[0];
        }
        return facultyOptions[0];
    });

    useEffect(() => {
        if (faculties.length && initialData.facultyId) {
            setSelectedFaculty(facultyOptions.find(f => f.value === initialData.facultyId) || facultyOptions[0]);
        } else if (faculties.length && !initialData.facultyId) {
            setSelectedFaculty(facultyOptions[0]);
        }
    }, [faculties, initialData.facultyId, facultyOptions]);

    const [selectedCapacity, setSelectedCapacity] = useState(() => {
        if (initialData.capacity) {
            return capacityOptions.find(c => c.value === String(initialData.capacity)) || capacityOptions[0];
        }
        return capacityOptions[0];
    });

    const [isExamHall, setIsExamHall] = useState(!!initialData.isExamHall);

    useEffect(() => {
        setIsExamHall(!!initialData.isExamHall);
    }, [initialData.isExamHall]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = Object.fromEntries(new FormData(form));
        formData.type = selectedType?.value || "";
        formData.capacity = parseInt(selectedCapacity.value);
        formData.isExamHall = isExamHall;
        formData.facultyId = Number(selectedFaculty?.value);
        if (onSubmit) onSubmit(formData);
    };

    const handleTypeChange = (option) => {
        setSelectedType(option);
    };

    const handleCapacityChange = (option) => {
        setSelectedCapacity(option);
    };

    const handleFacultyChange = (option) => {
        setSelectedFaculty(option);
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t(isEdit ? 'roomForm.title.edit' : 'roomForm.title.create')}
            description={t(isEdit ? 'roomForm.description.edit' : 'roomForm.description.create')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={isLoading ? t('roomForm.saving') : (isEdit ? t('roomForm.submit.edit') : t('roomForm.submit.create'))}
            submitLoading={isLoading}
        >
            <div className="space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputItem
                        label={t('roomForm.roomName')}
                        type="text"
                        id="name"
                        name="name"
                        placeholder={t('roomForm.roomNamePlaceholder')}
                        defaultValue={initialData.name || initialData.roomName || ""}
                        required
                    />

                    <div dir="rtl">
                        <InputItem
                            label={t('roomForm.roomNameAr')}
                            type="text"
                            id="nameAr"
                            name="nameAr"
                            placeholder={t('roomForm.roomNameArPlaceholder')}
                            defaultValue={initialData.nameAr || initialData.roomNameAr || ""}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <SelectBox
                        className="w-full"
                        label={t('roomForm.roomType')}
                        name="type"
                        labelDirection="flex-col"
                        options={roomTypes}
                        selectedOption={selectedType}
                        onChange={handleTypeChange}
                    />

                    <SelectBox
                        className="w-full"
                        label={t('roomForm.capacity')}
                        name="capacity"
                        labelDirection="flex-col"
                        options={capacityOptions}
                        selectedOption={selectedCapacity}
                        onChange={handleCapacityChange}
                    />
                </div>

                <InputItem
                    label={t('roomForm.location')}
                    type="text"
                    id="location"
                    name="location"
                    placeholder={t('roomForm.locationPlaceholder')}
                    defaultValue={initialData.location || initialData.roomLocation || initialData.Location || initialData.RoomLocation || ""}
                />

                <div dir="rtl">
                    <InputItem
                        label={t('roomForm.locationAr')}
                        type="text"
                        id="locationAr"
                        name="locationAr"
                        placeholder={t('roomForm.locationArPlaceholder')}
                        defaultValue={initialData.locationAr || initialData.roomLocationAr || ""}
                    />
                </div>

                <SelectBox
                    className="w-full"
                    label={t('roomForm.faculty')}
                    name="facultyId"
                    labelDirection="flex-col"
                    options={facultyOptions}
                    selectedOption={selectedFaculty}
                    onChange={handleFacultyChange}
                />

                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        name="isExamHall"
                        checked={isExamHall}
                        onChange={(e) => setIsExamHall(e.target.checked)}
                        className="w-4 h-4 rounded border-border-primary-default-light dark:border-border-primary-default-dark text-text-accent-active-light dark:text-text-accent-active-dark focus:ring-2 focus:ring-text-accent-active-light/40"
                    />
                    <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('roomForm.isExamHall')}
                    </span>
                </label>
            </div>
        </BaseFormComponent>
    );
}
