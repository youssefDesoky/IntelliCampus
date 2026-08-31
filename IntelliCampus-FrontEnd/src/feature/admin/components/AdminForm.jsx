import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "../../../components/ui/TextArea";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import SelectBox from "../../../components/ui/SelectBox";
import InputItem from "../../../components/form/InputItem";
import DateInput from "../../../components/form/DateInput";
import { UserIcon, CameraIcon } from "../../../components/ui/icons";
import { fetchAdminRoles } from "../services/adminAccountsApi";
import countryList from "react-select-country-list";
import {
  validateNationalIdOrPassport,
  validatePhoneNumber,
  EGYPT_NATIONALITY,
  EXCLUDED_COUNTRIES,
} from "../utils/validation";

export default function AdminForm({ onClose, method = "post", onSubmit, initialData = {} }) {
    const { t } = useTranslation('admin');
    const isEdit = method === "put";
    const fileInputRef = useRef(null);

    const [photoPreview, setPhotoPreview] = useState(initialData.profileImage || null);
    const [photoFile, setPhotoFile] = useState(null);
    const [roleOptions, setRoleOptions] = useState([]);

    // Synchronous — no fetch needed
    const nationalities = useMemo(() => countryList().getData().filter(c => !EXCLUDED_COUNTRIES.includes(c.value)), []);

    const [selectedNationality, setSelectedNationality] = useState(() => {
        if (initialData.nationality) {
            return (
                nationalities.find(
                    n => n.value === initialData.nationality || n.label === initialData.nationality
                ) || nationalities[0] || null
            );
        }
        return nationalities.find(n => n.value === "EG") || nationalities[0] || null;
    });

    const [selectedRole, setSelectedRole] = useState(null);

    const [errors, setErrors] = useState({});
    const isEgyptian = selectedNationality?.label === EGYPT_NATIONALITY;
    const idLabel = isEgyptian ? t('adminForm.nationalId') : t('adminForm.passportNumber');
    const idPlaceholder = isEgyptian ? t('adminForm.nationalIdPlaceholder') : t('adminForm.passportNumberPlaceholder');

    useEffect(() => {
        if (errors.nationalId) setErrors((prev) => ({ ...prev, nationalId: "" }));
    }, [selectedNationality]);

    useEffect(() => {
        fetchAdminRoles()
            .then(data => {
                const options = data.map(r => ({ value: r.value, label: r.label }));
                setRoleOptions(options);
                if (initialData.adminRole) {
                    const match = options.find(o => o.value?.toLowerCase() === initialData.adminRole?.toLowerCase());
                    if (match) setSelectedRole(match);
                } else if (initialData.roles) {
                    const adminRoleName = initialData.roles.find(r => r.toLowerCase().startsWith("admin_"));
                    if (adminRoleName) {
                        const match = options.find(o => o.value?.toLowerCase() === adminRoleName?.toLowerCase());
                        if (match) setSelectedRole(match);
                    }
                }
            })
            .catch(() => {
                setRoleOptions([
                    { value: "admin_bachelor", label: "Bachelor Admin" },
                    { value: "admin_masters", label: "Masters Admin" },
                    { value: "admin_phd", label: "PhD Admin" },
                    { value: "admin_diploma", label: "Diploma Admin" },
                    { value: "admin_academicstaff", label: "Academic Staff Admin" },
                ]);
            });
    }, []);

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleRemovePhoto = () => {
        setPhotoPreview(null);
        setPhotoFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        const nationalId = fd.get("nationalId") || "";
        const phoneNumber = fd.get("phoneNumber") || "";
        const nationality = selectedNationality?.label || "";
        const newErrors = {};
        const idErr = validateNationalIdOrPassport(nationalId, nationality);
        if (idErr) newErrors.nationalId = idErr;
        const phoneErr = validatePhoneNumber(phoneNumber);
        if (phoneErr) newErrors.phoneNumber = phoneErr;
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        const formData = Object.fromEntries(fd);
        formData.profileImage = photoPreview;
        formData.adminRole = selectedRole?.value || formData.role;
        formData.nationality = selectedNationality?.value;
        delete formData.role;
        onSubmit?.(formData);
    };

    return (
        <BaseFormComponent
            isOpen={true}
            title={t(isEdit ? 'adminForm.title.edit' : 'adminForm.title.create')}
            description={t(isEdit ? 'adminForm.description.edit' : 'adminForm.description.create')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={t(isEdit ? 'adminForm.submit.edit' : 'adminForm.submit.create')}
        >
            <div className="flex flex-col sm:flex-row gap-6 items-stretch sm:items-start">
                {/* Left: Photo */}
                <div className="flex flex-col items-center shrink-0 self-center sm:self-start">
                    <div className="relative">
                        <div
                            onClick={handlePhotoClick}
                            className="w-24 h-28 sm:w-32 sm:h-36 rounded-xl overflow-hidden ring-2 ring-border-primary-default-light dark:ring-border-primary-default-dark hover:ring-border-accent-active-light dark:hover:ring-border-accent-active-dark transition-all group"
                        >
                            {photoPreview ? (
                                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                    <UserIcon className="w-10 h-10 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                                <CameraIcon className="w-7 h-7 text-white" />
                            </div>
                        </div>
                        {photoPreview && (
                            <button
                                type="button"
                                onClick={handleRemovePhoto}
                                className="absolute -top-2 -end-2 w-5 h-5 rounded-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark flex items-center justify-center shadow-sm hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-3 h-3 fill-current"><path d="M18.3 5.71 12 12.01l-6.29-6.3-1.42 1.42 6.3 6.29-6.3 6.29 1.42 1.42 6.29-6.3 6.29 6.3 1.42-1.42-6.3-6.29 6.3-6.29z" /></svg>
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoChange}
                        className="hidden"
                    />
                    <p className="mt-2 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark text-center">
                        {t('adminForm.clickToPhoto', { action: photoPreview ? t('adminForm.change') : t('adminForm.upload') })}<br />{t('adminForm.profilePhoto')}
                    </p>
                </div>

                {/* Right: Fields */}
                <div className="w-full flex-1 min-w-0 space-y-5">
                    {/* Personal Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">{t('adminForm.personalInfo')}</h4>
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_.input-item]:w-full">
                            <InputItem label={t('adminForm.fullName')} type="text" name="fullName" placeholder={t('adminForm.fullNamePlaceholder')} defaultValue={initialData.fullName || ""} required />
                            <InputItem label={idLabel} type="text" name="nationalId" placeholder={idPlaceholder} defaultValue={initialData.nationalId || ""} errorMessage={errors.nationalId} required />
                            <InputItem label={t('adminForm.phoneNumber')} type="tel" name="phoneNumber" placeholder={t('adminForm.phoneNumberPlaceholder')} defaultValue={initialData.phoneNumber || initialData.phone || ""} errorMessage={errors.phoneNumber} required />
                            <div>
                                <SelectBox
                                    className="w-full"
                                    label={t('adminForm.nationality')}
                                    name="nationality"
                                    labelDirection="flex-col"
                                    options={nationalities}
                                    selectedOption={selectedNationality}
                                    onChange={setSelectedNationality}
                                />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block mb-2 text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('adminForm.address')}</label>
                                <TextArea
                                    name="address"
                                    placeholder={t('adminForm.addressPlaceholder')}
                                    defaultValue={initialData.address || ""}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light dark:focus:ring-border-accent-active-dark focus:border-border-accent-active-light outline-none transition-all placeholder:text-text-secondary-default-light dark:placeholder:text-text-secondary-default-dark"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Employment Info */}
                    <div className="pt-5">
                        <div className="flex items-center gap-3 mb-3">
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">{t('adminForm.employmentSection')}</h4>
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_.input-item]:w-full">
                            <SelectBox
                                className={`w-full ${isEdit ? 'sm:col-span-2' : ''}`}
                                label={t('adminForm.role')}
                                name="role"
                                labelDirection="flex-col"
                                options={roleOptions}
                                selectedOption={selectedRole}
                                onChange={setSelectedRole}
                            />
                            {!isEdit && (
                                <DateInput label={t('adminForm.hireDate')} name="hireDate" defaultValue={(initialData.hireDate || new Date().toISOString()).split("T")[0]} required />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BaseFormComponent>
    );
}