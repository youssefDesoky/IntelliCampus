import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import TextArea from "../../../components/ui/TextArea";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import SelectBox from "../../../components/ui/SelectBox";
import InputItem from "../../../components/form/InputItem";
import DateInput from "../../../components/form/DateInput";
import { UserIcon, CameraIcon } from "../../../components/ui/icons";
import { fetchInstructorRoles } from "../services/adminAccountsApi";
import { fetchDepartments, fetchSpecializations } from "../services/adminDepartmentsApi";
import { fetchRooms } from "../services/adminFacilitiesApi";
import { fetchInstructors, fetchFaculties, fetchProfessorsByFaculty } from "../services/adminInstructorsApi";
import countryList from "react-select-country-list";
import {
  validateNationalIdOrPassport,
  validatePhoneNumber,
  EGYPT_NATIONALITY,
  EXCLUDED_COUNTRIES,
} from "../utils/validation";

export default function InstructorForm({ onClose, method = "post", onSubmit, initialData = {}, mode = "create" }) {
    const { t } = useTranslation('admin');
    const isEdit = method === "put";
    const isLoanOnly = mode === "loan";
    const fileInputRef = useRef(null);

    const [photoPreview, setPhotoPreview] = useState(initialData.profileImage || null);
    const [photoFile, setPhotoFile] = useState(null);
    const [roleOptions, setRoleOptions] = useState([]);

    // Synchronous — no fetch needed
    const nationalities = useMemo(() => countryList().getData().filter(c => !EXCLUDED_COUNTRIES.includes(c.value)), []);

    // Single declaration — nationalities is available synchronously from useMemo
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
    const [status, setStatus] = useState(initialData.status || "employed");

    const [departments, setDepartments] = useState([]);
    const [selectedDepartment, setSelectedDepartment] = useState(null);
    const [specializations, setSpecializations] = useState([]);
    const [selectedSpecialization, setSelectedSpecialization] = useState(null);
    const [selectedLoanFaculty, setSelectedLoanFaculty] = useState(null);
    const [loanFacultyOptions, setLoanFacultyOptions] = useState([]);
    const [loanProfessorOptions, setLoanProfessorOptions] = useState([]);
    const [selectedLoanProfessor, setSelectedLoanProfessor] = useState(null);

    const [allRooms, setAllRooms] = useState([]);
    const [occupiedRoomIds, setOccupiedRoomIds] = useState(new Set());
    const [selectedRoom, setSelectedRoom] = useState(null);

    const isTAorAssistant = selectedRole && ["teachingassistant", "assistantlecturer"].includes(selectedRole.value);

    const availableRoomOptions = useMemo(() => {
        if (!allRooms.length) return [];
        return allRooms
            .filter(r => !occupiedRoomIds.has(r.roomId))
            .map(r => ({ value: r.roomId, label: r.roomName }));
    }, [allRooms, occupiedRoomIds]);

    const [errors, setErrors] = useState({});
    const isEgyptian = selectedNationality?.label === EGYPT_NATIONALITY;
    const idLabel = isEgyptian ? t('instructorForm.nationalId') : t('instructorForm.passportNumber');
    const idPlaceholder = isEgyptian ? t('instructorForm.nationalIdPlaceholder') : t('instructorForm.passportNumberPlaceholder');

    useEffect(() => {
        if (errors.nationalId) setErrors((prev) => ({ ...prev, nationalId: "" }));
    }, [selectedNationality]);

    useEffect(() => {
        fetchInstructorRoles()
            .then(data => {
                const options = data.map(r => ({
                    value: r.roleName,
                    label: r.roleName.charAt(0).toUpperCase() + r.roleName.slice(1).replace(/([A-Z])/g, ' $1').trim()
                }));
                setRoleOptions(options);
                if (initialData.instructorRole) {
                    const match = options.find(o => o.value === initialData.instructorRole);
                    if (match) setSelectedRole(match);
                }
            })
            .catch(() => {
                setRoleOptions([
                    { value: "teachingassistant", label: "Teaching Assistant" },
                    { value: "lecturer", label: "Lecturer" },
                    { value: "assistantlecturer", label: "Assistant Lecturer" },
                    { value: "associateprofessor", label: "Associate Professor" },
                    { value: "professor", label: "Professor" },
                ]);
            });
    }, []);

    useEffect(() => {
        fetchDepartments()
            .then(data => {
                const options = data.map(d => ({ value: d.departmentId, label: d.departmentName }));
                setDepartments(options);
                if (initialData.department) {
                    const match = options.find(o => o.value === initialData.department || o.label === initialData.department);
                    if (match) setSelectedDepartment(match);
                } else if (options.length > 0) {
                    setSelectedDepartment(options[0]);
                }
            })
            .catch(console.error);
    }, [initialData.department]);

    useEffect(() => {
        fetchFaculties()
            .then(data => {
                const options = (Array.isArray(data) ? data : []).map(f => ({ value: f.facultyId, label: f.facultyName }));
                setLoanFacultyOptions(options);
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (!selectedDepartment?.value) {
            setSpecializations([]);
            setSelectedSpecialization(null);
            return;
        }
        fetchSpecializations(selectedDepartment.value)
            .then(data => {
                const options = (Array.isArray(data) ? data : []).map(s => ({
                    value: s.id ?? s.specializationId,
                    label: s.name,
                }));
                setSpecializations(options);
                if (initialData.specializationId) {
                    const match = options.find(o => o.value === initialData.specializationId);
                    if (match) setSelectedSpecialization(match);
                }
            })
            .catch(() => setSpecializations([]));
    }, [selectedDepartment]);

    useEffect(() => {
        if (!selectedLoanFaculty?.value) {
            setLoanProfessorOptions([]);
            setSelectedLoanProfessor(null);
            return;
        }
        fetchProfessorsByFaculty(selectedLoanFaculty.value)
            .then(data => {
                const options = (Array.isArray(data) ? data : []).map(p => ({
                    value: p.instructorId,
                    label: p.fullName,
                }));
                setLoanProfessorOptions(options);
                if (initialData.loanProfessorId && !selectedLoanProfessor) {
                    const match = options.find(o => String(o.value) === String(initialData.loanProfessorId));
                    if (match) setSelectedLoanProfessor(match);
                } else if (options.length > 0 && !selectedLoanProfessor) {
                    setSelectedLoanProfessor(options[0]);
                }
            })
            .catch(() => setLoanProfessorOptions([]));
    }, [selectedLoanFaculty]);

    useEffect(() => {
        Promise.all([fetchRooms(), fetchInstructors()])
            .then(([rooms, instructors]) => {
                const occupied = new Set(
                    (instructors || [])
                        .map(i => i.officeHoursRoomId)
                        .filter(id => id != null)
                );
                if (initialData.officeHoursRoomId) {
                    occupied.delete(initialData.officeHoursRoomId);
                }
                setOccupiedRoomIds(occupied);
                setAllRooms(rooms || []);
                if (initialData.officeHoursRoomId) {
                    const match = (rooms || []).find(r => r.roomId === initialData.officeHoursRoomId);
                    if (match) setSelectedRoom({ value: match.roomId, label: match.roomName });
                }
            })
            .catch(console.error);
    }, []);

    useEffect(() => {
        if (selectedRoom && !availableRoomOptions.find(o => o.value === selectedRoom.value)) {
            setSelectedRoom(null);
        }
    }, [availableRoomOptions]);

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

        if (isLoanOnly) {
            const formData = Object.fromEntries(fd);
            formData.status = "loan";
            if (selectedLoanFaculty) {
                formData.loanFromFacultyId = selectedLoanFaculty.value;
            }
            if (selectedLoanProfessor) {
                formData.loanProfessorId = String(selectedLoanProfessor.value);
            }
            delete formData.departmentId;
            onSubmit?.(formData);
            return;
        }

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
        formData.instructorRole = selectedRole?.value || formData.role;
        formData.nationality = selectedNationality?.value;
        formData.departmentName = selectedDepartment?.label;
        formData.specializationId = selectedSpecialization?.value || null;
        formData.officeHoursRoomId = selectedRoom?.value || null;
        if (selectedLoanFaculty) {
            formData.loanFromFacultyId = selectedLoanFaculty.value;
        }
        if (selectedLoanProfessor) {
            formData.loanProfessorId = String(selectedLoanProfessor.value);
        }
        delete formData.role;
        delete formData.departmentId;
        onSubmit?.(formData);
    };

    return (
        <BaseFormComponent
            isOpen={true}
            title={isLoanOnly ? t('instructorForm.title.loan') : t(isEdit ? 'instructorForm.title.edit' : 'instructorForm.title.create')}
            description={isLoanOnly ? t('instructorForm.description.loan') : t(isEdit ? 'instructorForm.description.edit' : 'instructorForm.description.create')}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={isLoanOnly ? t('instructorForm.submit.loan') : t(isEdit ? 'instructorForm.submit.edit' : 'instructorForm.submit.create')}
        >
            {isLoanOnly ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_.input-item]:w-full">
                    <SelectBox
                        className="w-full"
                        label={t('instructorForm.loanFromCollege')}
                        name="loanFromFacultyId"
                        labelDirection="flex-col"
                        options={loanFacultyOptions}
                        selectedOption={selectedLoanFaculty}
                        onChange={setSelectedLoanFaculty}
                        required
                    />
                    <SelectBox
                        className="w-full"
                        label={t('instructorForm.loanProfessor')}
                        name="loanProfessorId"
                        labelDirection="flex-col"
                        options={loanProfessorOptions}
                        selectedOption={selectedLoanProfessor}
                        onChange={setSelectedLoanProfessor}
                        placeholder={loanProfessorOptions.length === 0 ? t('instructorForm.selectCollegeFirst') : t('instructorForm.selectProfessor')}
                        required
                    />
                    <div>
                        <DateInput label={t('instructorForm.contractStartDate')} name="contractStartDate" defaultValue={(initialData.contractStartDate || new Date().toISOString()).split("T")[0]} required />
                    </div>
                    <div>
                        <DateInput label={t('instructorForm.contractEndDate')} name="contractEndDate" defaultValue={(initialData.contractEndDate || "").split("T")[0]} required />
                    </div>
                </div>
            ) : (
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
                        {t('instructorForm.clickToPhoto', { action: photoPreview ? t('instructorForm.change') : t('instructorForm.upload') })}<br />{t('instructorForm.profilePhoto')}
                    </p>
                </div>

                {/* Right: Fields */}
                <div className="w-full flex-1 min-w-0 space-y-5">
                    {/* Personal Info */}
                    <div>
                        <div className="flex items-center gap-3 mb-3">
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">{t('instructorForm.personalInfo')}</h4>
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_.input-item]:w-full">
                            <InputItem label={t('instructorForm.fullName')} type="text" name="fullName" placeholder={t('instructorForm.fullNamePlaceholder')} defaultValue={initialData.fullName || ""} required />
                            <InputItem label={idLabel} type="text" name="nationalId" placeholder={idPlaceholder} defaultValue={initialData.nationalId || ""} errorMessage={errors.nationalId} required />
                            <InputItem label={t('instructorForm.phoneNumber')} type="tel" name="phoneNumber" placeholder={t('instructorForm.phoneNumberPlaceholder')} defaultValue={initialData.phoneNumber || initialData.phone || ""} errorMessage={errors.phoneNumber} required />
                            <div>
                                <SelectBox
                                    className="w-full"
                                    label={t('instructorForm.nationality')}
                                    name="nationality"
                                    labelDirection="flex-col"
                                    options={nationalities}
                                    selectedOption={selectedNationality}
                                    onChange={setSelectedNationality}
                                />
                            </div>
                            <div className="col-span-1 sm:col-span-2">
                                <label className="block mb-2 text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('instructorForm.address')}</label>
                                <TextArea
                                    name="address"
                                    placeholder={t('instructorForm.addressPlaceholder')}
                                    defaultValue={initialData.address || ""}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light dark:focus:ring-border-accent-active-dark focus:border-border-accent-active-light outline-none transition-all placeholder:text-text-secondary-default-light dark:placeholder:text-text-secondary-default-dark"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Professional Info */}
                    <div className="pt-5">
                        <div className="flex items-center gap-3 mb-3">
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">{t('instructorForm.professionalInfo')}</h4>
                            <hr className="flex-1 border-border-primary-default-light dark:border-border-primary-default-dark" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 [&_.input-item]:w-full">
                            <SelectBox
                                className="w-full"
                                label={t('instructorForm.role')}
                                name="role"
                                labelDirection="flex-col"
                                options={roleOptions}
                                selectedOption={selectedRole}
                                onChange={setSelectedRole}
                            />
                            <SelectBox
                                className="w-full"
                                label={t('instructorForm.department')}
                                name="departmentId"
                                labelDirection="flex-col"
                                options={departments}
                                selectedOption={selectedDepartment}
                                onChange={setSelectedDepartment}
                            />
                            <SelectBox
                                className={`w-full ${isEdit ? 'sm:col-span-2' : ''}`}
                                label={t('instructorForm.specialization')}
                                name="specializationId"
                                labelDirection="flex-col"
                                options={specializations}
                                selectedOption={selectedSpecialization}
                                onChange={setSelectedSpecialization}
                            />
                            {selectedRole && (
                                <SelectBox
                                    className="w-full"
                                    label={isTAorAssistant ? t('instructorForm.commonRoom') : t('instructorForm.officeRoom')}
                                    name="officeHoursRoomId"
                                    labelDirection="flex-col"
                                    options={availableRoomOptions}
                                    selectedOption={selectedRoom}
                                    onChange={setSelectedRoom}
                                />
                            )}
                            {!isEdit && status === "employed" && (
                                <div className={selectedRole ? 'sm:col-span-2' : ''}>
                                    <DateInput label={t('instructorForm.hireDate')} name="hireDate" defaultValue={(initialData.hireDate || new Date().toISOString()).split("T")[0]} required />
                                </div>
                            )}
                            {!isEdit && status === "loan" && (
                                <>
                                    <SelectBox
                                        className="w-full"
                                        label={t('instructorForm.loanFromCollege')}
                                        name="loanFromFacultyId"
                                        labelDirection="flex-col"
                                        options={loanFacultyOptions}
                                        selectedOption={selectedLoanFaculty}
                                        onChange={setSelectedLoanFaculty}
                                        required
                                    />
                                    <SelectBox
                                        className="w-full"
                                        label={t('instructorForm.loanProfessor')}
                                        name="loanProfessorId"
                                        labelDirection="flex-col"
                                        options={loanProfessorOptions}
                                        selectedOption={selectedLoanProfessor}
                                        onChange={setSelectedLoanProfessor}
                                        placeholder={loanProfessorOptions.length === 0 ? t('instructorForm.selectCollegeFirst') : t('instructorForm.selectProfessor')}
                                        required
                                    />
                                    <div>
                                        <DateInput label={t('instructorForm.contractStartDate')} name="contractStartDate" defaultValue={(initialData.contractStartDate || new Date().toISOString()).split("T")[0]} required />
                                    </div>
                                    <div>
                                        <DateInput label={t('instructorForm.contractEndDate')} name="contractEndDate" defaultValue={(initialData.contractEndDate || "").split("T")[0]} required />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            )}
        </BaseFormComponent>
    );
}