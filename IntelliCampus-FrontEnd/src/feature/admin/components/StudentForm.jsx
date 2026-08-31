import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import countryList from "react-select-country-list";
import TextArea from "../../../components/ui/TextArea";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import SelectBox from "../../../components/ui/SelectBox";
import RadioToggle from "../../../components/form/RadioToggle";
import InputItem from "../../../components/form/InputItem";
import DateInput from "../../../components/form/DateInput";
import { UserIcon, CameraIcon } from "../../../components/ui/icons";
import { fetchBylaws } from "../services/adminBylawsApi";
import { fetchDepartments } from "../services/adminDepartmentsApi";
import { fetchStudentTypes } from "../services/adminStudentsApi";
import {
  validateNationalIdOrPassport,
  validatePhoneNumber,
  EGYPT_NATIONALITY,
  EXCLUDED_COUNTRIES,
} from "../utils/validation";

const programs = [
    { value: "General", label: "General" },
    { value: "Credit", label: "Credit" },
];

export default function StudentForm({ onClose, method = "post", onSubmit, initialData = {}, isSuperAdmin = false, defaultStudentType }) {
    const { t } = useTranslation('admin');
    const isEdit = method === "put";
    const fileInputRef = useRef(null);

    const [bylaws, setBylaws] = useState([]);
    const [photoPreview, setPhotoPreview] = useState(initialData.profileImage || null);
    const [photoFile, setPhotoFile] = useState(null);

    const defaultType = (defaultStudentType || 'bachelor').toLowerCase();
    const [studentTypes, setStudentTypes] = useState([]);
    const [selectedStudentType, setSelectedStudentType] = useState(
        studentTypes.find(t => t.value === defaultType) || studentTypes[0]
    );

    // Synchronous — no fetch needed
    const nationalities = useMemo(() => countryList().getData().filter(c => !EXCLUDED_COUNTRIES.includes(c.value)), []);

    const isPostgrad = ["masters", "phd", "diploma"].includes(selectedStudentType?.value);

    const [selectedProgram, setSelectedProgram] = useState(() => {
        if (initialData.program) {
            return programs.find(p => p.value === initialData.program || p.label === initialData.program) || programs[0];
        }
        return programs[0];
    });

    const isCredit = selectedProgram?.value === "Credit";

    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [selectedBylaw, setSelectedBylaw] = useState(null);

    // nationalities is synchronously available from useMemo, so the initializer works on first render
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

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (errors.nationalId) setErrors((prev) => ({ ...prev, nationalId: "" }));
    }, [selectedNationality]);

    useEffect(() => {
        fetchStudentTypes()
            .then(data => {
                const options = data.map(t => ({ value: t.toLowerCase(), label: t }));
                setStudentTypes(options);
                if (options.length > 0) {
                    const initialType = isEdit && initialData.studentType
                        ? initialData.studentType.toLowerCase()
                        : defaultType;
                    const defaultOption = options.find(t => t.value === initialType) || options[0];
                    setSelectedStudentType(defaultOption);
                }
            })
            .catch(console.error);
    }, [defaultType, isEdit, initialData.studentType]);

    const bylawTypeMap = {
        bachelor: 'Bachelor',
        masters: 'Master',
        phd: 'PhD',
        diploma: 'Diploma',
    };

    useEffect(() => {
        const type = selectedStudentType?.value ? bylawTypeMap[selectedStudentType.value] : undefined;
        fetchBylaws({ type })
            .then(result => {
                const data = Array.isArray(result) ? result : (result?.data ?? []);
                const options = data.map(b => ({ value: b.bylawId, label: b.name }));
                setBylaws(options);
                setSelectedBylaw(null);
                if (initialData.bylawId) {
                    const match = options.find(o => o.value === initialData.bylawId);
                    if (match) setSelectedBylaw(match);
                }
            })
            .catch(console.error);
    }, [selectedStudentType, initialData.bylawId]);

    useEffect(() => {
        fetchDepartments()
            .then(result => {
                const data = Array.isArray(result) ? result : (result?.data ?? []);
                const options = data.map(d => ({ value: d.departmentId, label: d.departmentName }));
                setDepartments(options);
                if (initialData.departmentId) {
                    const match = options.find(o => o.value === initialData.departmentId);
                    if (match) setSelectedDepartment(match);
                } else if (initialData.departmentName) {
                    const match = options.find(o => o.label === initialData.departmentName);
                    if (match) setSelectedDepartment(match);
                }
            })
            .catch(console.error);
    }, [initialData.departmentId, initialData.departmentName]);

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

    const isEgyptian = selectedNationality?.label === EGYPT_NATIONALITY;
    const idLabel = isEgyptian ? t('studentForm.nationalId') : t('studentForm.passportNumber');
    const idPlaceholder = isEgyptian ? t('studentForm.nationalIdPlaceholder') : t('studentForm.passportNumberPlaceholder');

    const validate = (form) => {
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
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate(e.currentTarget)) return;
        const form = e.currentTarget;
        const formData = Object.fromEntries(new FormData(form));
        if (!isEdit) formData.level = 1;
        formData.profileImage = photoPreview ?? "";
        formData.bylawId = selectedBylaw?.value || formData.bylawId;
        if (isSuperAdmin && !isEdit) {
            formData.studentType = selectedStudentType?.value || formData.studentType;
        }
        formData.departmentId = selectedDepartment?.value || null;
        onSubmit?.(formData);
    };

    return (
        <BaseFormComponent
            isOpen={true}
            title={t(isEdit ? 'studentForm.title.edit' : 'studentForm.title.create')}
            description={t(isEdit ? 'studentForm.description.edit' : 'studentForm.description.create')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={t(isEdit ? 'studentForm.submit.edit' : 'studentForm.submit.create')}
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
                        {t('studentForm.clickToPhoto', { action: photoPreview ? t('studentForm.change') : t('studentForm.upload') })}<br />{t('studentForm.profilePhoto')}
                    </p>
                </div>

                {/* Right: Fields */}
                <div className="w-full flex-1 min-w-0 space-y-5">
                    {/* Personal Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">{t('studentForm.personalInfo')}</h4>
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_.input-item]:w-full">
                            <InputItem label={t('studentForm.fullName')} type="text" name="fullName" placeholder={t('studentForm.fullNamePlaceholder')} defaultValue={initialData.fullName || ""} required />
                            <InputItem label={idLabel} type="text" name="nationalId" placeholder={idPlaceholder} defaultValue={initialData.nationalId || ""} errorMessage={errors.nationalId} required />
                            <InputItem label={t('studentForm.phoneNumber')} type="tel" name="phoneNumber" placeholder={t('studentForm.phoneNumberPlaceholder')} defaultValue={initialData.phoneNumber || initialData.phone || ""} errorMessage={errors.phoneNumber} required />
                            <div>
                                <SelectBox
                                    className="w-full"
                                    label={t('studentForm.nationality')}
                                    name="nationality"
                                    labelDirection="flex-col"
                                    options={nationalities}
                                    selectedOption={selectedNationality}
                                    onChange={setSelectedNationality}
                                />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block mb-2 text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('studentForm.address')}</label>
                                <TextArea
                                    name="address"
                                    placeholder={t('studentForm.addressPlaceholder')}
                                    defaultValue={initialData.address || ""}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light dark:focus:ring-border-accent-active-dark focus:border-border-accent-active-light outline-none transition-all placeholder:text-text-secondary-default-light dark:placeholder:text-text-secondary-default-dark"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Academic Info */}
                    <div className="pt-5">
                        <div className="flex items-center gap-3 mb-3">
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">{t('studentForm.academicInfo')}</h4>
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_.input-item]:w-full">

                            {isSuperAdmin && !isEdit && studentTypes.length > 0 && (
                                <div className="col-span-1 sm:col-span-2">
                                    <label className="block mb-2 text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('studentForm.studentType')}</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        {studentTypes.map((type) => (
                                            <label key={type.value} className={`option flex items-center gap-3 select-none rounded-md transition-all border p-2 cursor-pointer ${selectedStudentType?.value === type.value ? 'border-border-primary-default-light bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark' : 'border-border-primary-default-light bg-transparent'}`}>
                                                <input
                                                    type="radio"
                                                    name="studentType"
                                                    value={type.value}
                                                    checked={selectedStudentType?.value === type.value}
                                                    onChange={() => {
                                                        setSelectedStudentType(type);
                                                        if (type.value === 'bachelor') {
                                                            setSelectedDepartment(null);
                                                            setSelectedSpecialization(null);
                                                        }
                                                    }}
                                                    className="hidden"
                                                />
                                                <div className={`dot h-4 w-4 rounded-full flex items-center justify-center ${selectedStudentType?.value === type.value ? 'bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark' : 'bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark'}`}>
                                                    {selectedStudentType?.value === type.value ? <div className="inner h-2 w-2 rounded-full bg-text-primary-default-light dark:bg-text-primary-default-dark" /> : null}
                                                </div>
                                                <span className="text-sm">{type.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {!isPostgrad && (
                                <SelectBox
                                    className={`w-full ${isEdit ? 'sm:col-span-2' : ''}`}
                                    label={t('studentForm.bylaw')}
                                    name="bylawId"
                                    labelDirection="flex-col"
                                    options={bylaws}
                                    selectedOption={selectedBylaw}
                                    onChange={setSelectedBylaw}
                                />
                            )}

                            {!isPostgrad && !isEdit && (
                                <div className="flex flex-col">
                                    <label className="block mb-2 text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('studentForm.program')}</label>
                                    <RadioToggle
                                        name="program"
                                        options={programs}
                                        value={selectedProgram.value}
                                        onChange={(value) => {
                                            const selected = programs.find(p => p.value === value) || programs[0];
                                            setSelectedProgram(selected);
                                        }}
                                        className="w-full"
                                    />
                                </div>
                            )}

                            {!isPostgrad && isCredit && !isEdit && (
                                <SelectBox
                                    className="w-full"
                                    label={t('studentForm.department')}
                                    name="departmentId"
                                    labelDirection="flex-col"
                                    options={departments}
                                    selectedOption={selectedDepartment}
                                    onChange={setSelectedDepartment}
                                />
                            )}

                            {!isPostgrad && isCredit && !isEdit && (
                                <DateInput label={t('studentForm.enrollmentDate')} name="enrollmentDate" defaultValue={new Date().toISOString().split("T")[0]} required />
                            )}

                            {!isPostgrad && !isCredit && !isEdit && (
                                <div className="col-span-1 sm:col-span-2">
                                    <DateInput label={t('studentForm.enrollmentDate')} name="enrollmentDate" defaultValue={new Date().toISOString().split("T")[0]} required />
                                </div>
                            )}

                            {isPostgrad && (
                                <>
                                    <SelectBox
                                        className={`w-full ${isEdit ? 'sm:col-span-2' : ''}`}
                                        label={t('studentForm.bylaw')}
                                        name="bylawId"
                                        labelDirection="flex-col"
                                        options={bylaws}
                                        selectedOption={selectedBylaw}
                                        onChange={setSelectedBylaw}
                                    />
                                    <SelectBox
                                        className="w-full"
                                        label={t('studentForm.department')}
                                        name="departmentId"
                                        labelDirection="flex-col"
                                        options={departments}
                                        selectedOption={selectedDepartment}
                                        onChange={setSelectedDepartment}
                                    />
                                    {!isEdit && (
                                        <div className="flex flex-col">
                                            <label className="block mb-2 text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('studentForm.program')}</label>
                                            <RadioToggle
                                                name="program"
                                                options={programs}
                                                value={selectedProgram.value}
                                                onChange={(value) => {
                                                    const selected = programs.find(p => p.value === value) || programs[0];
                                                    setSelectedProgram(selected);
                                                }}
                                                className="w-full"
                                            />
                                        </div>
                                    )}
                                    {!isEdit && (
                                        <div className="col-span-1 sm:col-span-2">
                                            <DateInput label={t('studentForm.enrollmentDate')} name="enrollmentDate" defaultValue={new Date().toISOString().split("T")[0]} required />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </BaseFormComponent>
    );
}