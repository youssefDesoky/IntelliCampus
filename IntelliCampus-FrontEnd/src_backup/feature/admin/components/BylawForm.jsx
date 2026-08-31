import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import InputItem from "../../../components/form/InputItem";
import SelectBox from "../../../components/ui/SelectBox";
import TextArea from "../../../components/ui/TextArea";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import { CloudUploadIcon, FileLinesIcon } from "../../../components/ui/icons";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { API_URL } from "../../../config/api";

const bylawTypes = [
    { value: "Bachelor", label: "Bachelor" },
    { value: "Master", label: "Master" },
    { value: "PhD", label: "PhD" },
    { value: "Diploma", label: "Diploma" },
];

export default function BylawForm({ onClose, onSubmit, initialData = {}, isLoading = false, isOpen = true }) {
    const { t } = useTranslation('admin');
    const { showError } = useError();
    const isEdit = !!initialData.bylawId;
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({ name: "", nameAr: "", description: "", descriptionAr: "" });
    const [selectedType, setSelectedType] = useState(() => {
        if (initialData.type) {
            return bylawTypes.find(t => t.value === initialData.type) || bylawTypes[0];
        }
        return bylawTypes[0];
    });

    useEffect(() => {
        setFormData({
            name: initialData.name || "",
            nameAr: initialData.nameAr || "",
            description: initialData.description || "",
            descriptionAr: initialData.descriptionAr || "",
        });
        if (initialData.type) {
            setSelectedType(bylawTypes.find(t => t.value === initialData.type) || bylawTypes[0]);
        }
    }, [initialData.name, initialData.nameAr, initialData.description, initialData.descriptionAr, initialData.type]);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const name = formData.name.trim();

        if (!name) {
            showError(t('manageBylaws.bylawNameRequired'));
            return;
        }

        const payload = {
            name,
            nameAr: formData.nameAr.trim(),
            description: formData.description.trim(),
            descriptionAr: formData.descriptionAr.trim(),
            type: selectedType.value,
        };

        try {
            await onSubmit({ ...payload, _file: selectedFile || null });
            onClose();
        } catch (err) {
            showError(err.message || t('manageBylaws.errorOccurred'));
        }
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t(isEdit ? 'bylawForm.title.edit' : 'bylawForm.title.create')}
            description={t(isEdit ? 'bylawForm.description.edit' : 'bylawForm.description.create')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={isLoading ? t('roomForm.saving') : (isEdit ? t('bylawForm.submit.edit') : t('bylawForm.submit.create'))}
            submitLoading={isLoading}
        >
            <div className="space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputItem
                        label={t('manageBylaws.name')}
                        type="text"
                        name="name"
                        placeholder={t('manageBylaws.namePlaceholder')}
                        value={formData.name}
                        onChange={handleChange("name")}
                        required
                    />
                    <div dir="rtl">
                        <InputItem
                            label={t('bylawForm.nameAr')}
                            type="text"
                            name="nameAr"
                            placeholder={t('bylawForm.nameArPlaceholder')}
                            value={formData.nameAr}
                            onChange={handleChange("nameAr")}
                        />
                    </div>
                </div>

                <SelectBox
                    className="w-full"
                    label={t('manageBylaws.bylawType')}
                    name="type"
                    labelDirection="flex-col"
                    options={bylawTypes}
                    selectedOption={selectedType}
                    onChange={(option) => setSelectedType(option)}
                    disabled={isEdit}
                />

                <div>
                    <label htmlFor="description" className="block text-sm font-medium mb-2 text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('manageBylaws.description')}
                    </label>
                    <TextArea
                        id="description"
                        name="description"
                        className="w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md focus:outline-none focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                        placeholder={t('manageBylaws.descriptionPlaceholder')}
                        value={formData.description}
                        onChange={handleChange("description")}
                    />
                </div>

                <div dir="rtl">
                    <label htmlFor="descriptionAr" className="block text-sm font-medium mb-2 text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('bylawForm.descriptionAr')}
                    </label>
                    <TextArea
                        id="descriptionAr"
                        name="descriptionAr"
                        className="w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md focus:outline-none focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                        placeholder={t('bylawForm.descriptionArPlaceholder')}
                        value={formData.descriptionAr}
                        onChange={handleChange("descriptionAr")}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2 text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('manageBylaws.document')}
                    </label>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg p-4 text-center hover:border-border-accent-default-light dark:hover:border-border-accent-default-dark transition-colors cursor-pointer"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="hidden"
                        />
                        {selectedFile ? (
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <CloudUploadIcon className="w-5 h-5 text-text-accent-default-light dark:text-text-accent-default-dark" />
                                <span className="text-text-primary-default-light dark:text-text-primary-default-dark">{selectedFile.name}</span>
                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); setSelectedFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                    className="text-text-danger-default-light dark:text-text-danger-default-dark hover:underline text-xs"
                                >
                                    {t('form.removeFile')}
                                </button>
                            </div>
                        ) : isEdit && initialData.fileName ? (
                            <div className="flex items-center justify-center gap-2 text-sm">
                                <FileLinesIcon className="w-5 h-5 text-text-accent-default-light dark:text-text-accent-default-dark" />
                                <a
                                    href={`${API_URL}/api/Bylaw/${initialData.bylawId}/download`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-text-primary-default-light dark:text-text-primary-default-dark hover:underline"
                                >
                                    {initialData.fileName}
                                </a>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedFile(null);
                                        if (fileInputRef.current) fileInputRef.current.value = "";
                                    }}
                                    className="text-text-danger-default-light dark:text-text-danger-default-dark hover:underline text-xs"
                                >
                                    {t('bylawForm.replace')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-center gap-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                <CloudUploadIcon className="w-5 h-5" />
                                {t('bylawForm.uploadDocument')}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </BaseFormComponent>
    );
}
