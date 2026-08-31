import { useState } from "react";
import { useTranslation } from "react-i18next";
import InputItem from "../../../components/form/InputItem";
import NumberInput from "../../../components/form/NumberInput";
import SelectBox from "../../../components/ui/SelectBox";
import Button from "../../../components/ui/Button";
import TextArea from "../../../components/ui/TextArea";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import { XIcon } from "../../../components/ui/icons";
import { useError } from '../../../contexts/ErrorContext.jsx';

const emptyInstructorOption = { value: "", label: null };

export default function DepartmentForm({ onClose, onSubmit, initialData = {}, instructors = [], isLoading = false, isOpen = true }) {
    const { t } = useTranslation('admin');
    const { showError } = useError();
    const isEdit = !!(initialData.id ?? initialData.departmentId);
    const instructorOptions = [
        emptyInstructorOption,
        ...instructors.map((instructor) => ({
            value: String(instructor.userId),
            label: instructor.fullName || instructor.name,
        })),
    ];

    const [selectedInstructor, setSelectedInstructor] = useState(() => {
        if (initialData.instructorId) {
            return instructorOptions.find(option => option.value === String(initialData.instructorId)) || emptyInstructorOption;
        }
        return emptyInstructorOption;
    });
    const [maxCapacity, setMaxCapacity] = useState(initialData.maxCapacity ?? "");
    const handleSubmit = async (e) => {
        e.preventDefault();
        const departmentName = ((e.target.departmentName?.value) || "").trim();

        if (!departmentName) {
            showError(t('departmentForm.nameRequired'));
            return;
        }

        try {
            await onSubmit({
                departmentName,
                departmentNameAr: ((e.target.departmentNameAr?.value) || "").trim(),
                description: ((e.target.description?.value) || "").trim(),
                descriptionAr: ((e.target.descriptionAr?.value) || "").trim(),
                instructorId: selectedInstructor.value || null,
                maxCapacity: maxCapacity ? parseInt(maxCapacity) : null,
            });
        } catch (err) {
            showError(err.message || t('manageBylaws.errorOccurred'));
        }
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t(isEdit ? 'departmentForm.title.edit' : 'departmentForm.title.create')}
            description={t(isEdit ? 'departmentForm.description.edit' : 'departmentForm.description.create')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={isLoading ? t('roomForm.saving') : (isEdit ? t('departmentForm.submit.edit') : t('departmentForm.submit.create'))}
            submitLoading={isLoading}
        >
            <div className="space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputItem
                        label={t('departmentForm.departmentName')}
                        type="text"
                        name="departmentName"
                        placeholder={t('departmentForm.departmentNamePlaceholder')}
                        defaultValue={initialData.departmentName || ""}
                        required
                    />

                    <div dir="rtl">
                        <InputItem
                            label={t('departmentForm.departmentNameAr')}
                            type="text"
                            name="departmentNameAr"
                            placeholder={t('departmentForm.departmentNameArPlaceholder')}
                            defaultValue={initialData.departmentNameAr || ""}
                        />
                    </div>
                </div>

                <SelectBox
                    className="w-full"
                    label={t('departmentForm.headInstructor')}
                    name="instructorId"
                    labelDirection="flex-col"
                    options={instructorOptions}
                    selectedOption={selectedInstructor}
                    onChange={setSelectedInstructor}
                />

                <NumberInput
                    label={t('departmentForm.maxCapacity')}
                    name="maxCapacity"
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(e.target.value)}
                    placeholder={t('departmentForm.maxCapacityPlaceholder')}
                    min="0"
                    className="w-full"
                />

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2 text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('departmentForm.description')}
                    </label>
                    <TextArea
                        id="description"
                        name="description"
                        className="w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md focus:outline-none focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                        placeholder={t('departmentForm.descriptionPlaceholder')}
                        defaultValue={initialData.description || ""}
                    />
                </div>

                <div dir="rtl">
                    <label htmlFor="descriptionAr" className="block text-sm font-medium mb-2 text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('departmentForm.descriptionAr')}
                    </label>
                    <TextArea
                        id="descriptionAr"
                        name="descriptionAr"
                        className="w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md focus:outline-none focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                        placeholder={t('departmentForm.descriptionArPlaceholder')}
                        defaultValue={initialData.descriptionAr || ""}
                    />
                </div>
            </div>
        </BaseFormComponent>
    );
}