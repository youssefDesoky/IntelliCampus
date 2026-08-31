import { useTranslation } from 'react-i18next';
import {
    BookIcon,
    CheckIcon,
    ChartLineIcon,
    FilePenIcon,
    UserIcon,
} from "../../../components/ui/icons";

function InfoField({ label, value }) {
    return (
        <div className="space-y-0.5">
            <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark block">{label}</span>
            <span className="font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{value ?? "—"}</span>
        </div>
    );
}

export default function StudentInfoTab({ student, completedCount, registeredCount }) {
    const { t } = useTranslation('admin');
    const isBachelor = student.studentType === "Bachelor";
    return (
        <div className="space-y-6">
            <div className="hidden sm:grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                    { label: t('studentDetails.gpa'), value: student.gpa ?? "—", color: "text-emerald-500", icon: ChartLineIcon },
                    ...(isBachelor
                        ? [{ label: t('studentDetails.level'), value: student.level ?? "—", color: "text-blue-500", icon: BookIcon }]
                        : [{ label: t('studentDetails.type'), value: student.studentType ?? "—", color: "text-blue-500", icon: BookIcon }]
                    ),
                    { label: t('studentDetails.completed'), value: completedCount, color: "text-purple-500", icon: CheckIcon },
                    { label: t('studentDetails.registered'), value: registeredCount, color: "text-amber-500", icon: FilePenIcon },
                ].map((stat) => (
                    <div key={stat.label} className="flex items-center gap-3 p-4 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark`}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{stat.label}</p>
                            <p className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2 flex flex-col items-center text-center p-4 sm:p-6 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-gradient-to-b from-bg-surface-secondary-default-light to-bg-surface-primary-default-light dark:from-bg-surface-secondary-default-dark dark:to-bg-surface-primary-default-dark h-full">
                    <div className="relative mb-5">
                        <div className="w-36 h-36 rounded-2xl overflow-hidden bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark ring-4 ring-bg-surface-primary-default-light dark:ring-bg-surface-primary-default-dark shadow-xl shrink-0">
                            {student.profileImage ? (
                                <img src={student.profileImage} alt={student.fullName || student.name} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-bg-surface-accent-default-light to-bg-surface-secondary-default-light dark:from-bg-surface-accent-default-dark dark:to-bg-surface-secondary-default-dark">
                                    <UserIcon className="w-14 h-14 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                </div>
                            )}
                        </div>
                        <div className="absolute -bottom-2 start-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-[11px] font-bold text-text-accent-active-light dark:text-text-accent-active-dark shadow-sm">
                            {isBachelor ? `${t('studentDetails.level')} ${student.level ?? "—"}` : student.studentType ?? "—"}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold tracking-tight text-text-primary-default-light dark:text-text-primary-default-dark line-clamp-2 px-2">
                        {student.fullName || student.name}
                    </h2>
                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark font-mono tracking-wider mt-2">
                        {student.studentCode || "—"}
                    </p>
                    <div className="w-full mt-auto pt-6">
                        <div className="grid grid-cols-2 gap-3 w-full">
                            <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-3 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark">
                                <span className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('studentDetails.gpa')}</span>
                                <span className="text-2xl font-extrabold text-emerald-500">{student.gpa ?? "—"}</span>
                            </div>
                            <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-3 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark">
                                <span className="block text-[10px] uppercase font-bold tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{isBachelor ? t('studentDetails.program') : t('studentDetails.specialization')}</span>
                                <span className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{isBachelor ? (student.program ?? "—") : (student.specializationName ?? "—")}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-3 flex flex-col gap-3 sm:gap-4">
                    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
                        <div className="px-3 sm:px-5 py-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('studentDetails.personalDetails')}</h3>
                        </div>
                        <div className="p-3 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                <InfoField label={t('studentDetails.nationalId')} value={student.nationalId} />
                                <InfoField label={t('studentDetails.nationality')} value={student.nationality} />
                                <InfoField label={t('studentDetails.email')} value={student.email} />
                                <InfoField label={t('studentDetails.phone')} value={student.phone ?? student.phoneNumber} />
                                <div className="space-y-0.5 sm:col-span-2">
                                    <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark block">{t('studentDetails.address')}</span>
                                    <span className="font-medium text-text-primary-default-light dark:text-text-primary-default-dark break-words">{student.address ?? "—"}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
                        <div className="px-3 sm:px-5 py-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark flex items-center gap-2">
                            <BookIcon className="w-4 h-4 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                            <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('studentDetails.academicInfo')}</h3>
                        </div>
                        <div className="p-3 sm:p-5">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                                {isBachelor ? (
                                    <InfoField label={t('studentDetails.program')} value={student.program} />
                                ) : (
                                    <InfoField label={t('studentDetails.specialization')} value={student.specializationName} />
                                )}
                                <InfoField label={t('studentDetails.department')} value={student.department ?? student.departmentName ?? student.faculty} />
                                <InfoField label={t('studentDetails.bylaw')} value={student.bylawName ?? student.bylaw} />
                                <InfoField label={t('studentDetails.enrollmentDate')} value={student.enrollmentDate ?? student.enrolledAt} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
