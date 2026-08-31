import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { useRouteLoaderData } from "react-router-dom";
import IdentityCard from "../../../feature/student/profile/IdentityCard";
import AccountControlsCard from "../../../feature/student/profile/AccountControlsCard";
import AcademicInfoCard from "../../../feature/student/profile/AcademicInfoCard";
import PerformanceCard from "../../../feature/student/profile/PerformanceCard";
import { fetchStudentProfile } from "../../../api/studentProfile";
function mapBackendToUserData(student) {
    return {
        name: student.fullName,
        avatar: student.profileImage || "",
        specialization: student.specializationName || "",
        department: student.departmentName || "",
        faculty: student.facultyName || "",
        studentSince: student.enrollmentDate || "",
        email: student.email || "",
        phone: student.phoneNumber || "",
        address: student.address || "",
        studentCode: student.studentCode || "",
        level: student.level,
        studentType: student.studentType || "",
        bylaw: student.bylawName || "",
        gpa: student.gpa,
        courses: student.courses || [],
        qrCode: "",
        fullNameAr: student.fullNameAr || "",
    };
}

function mapAuthToUserData(auth) {
    if (!auth) return null;
    return {
        name: auth.fullName || auth.name || "",
        avatar: auth.profileImage || "",
        email: auth.email || "",
        phone: auth.phoneNumber || auth.phone || "",
        address: auth.address || "",
        specialization: auth.specialization || "",
        department: auth.departmentName || auth.department || "",
        faculty: auth.facultyName || auth.faculty || "",
        studentSince: auth.enrollmentDate || "",
        studentCode: auth.studentCode || "",
        level: auth.level,
        studentType: auth.studentType || "",
        bylaw: auth.bylawName || "",
        gpa: auth.gpa,
        courses: auth.courses || [],
        qrCode: "",
        fullNameAr: auth.fullNameAr || "",
    };
}

export default function Profile() {
    const { t } = useTranslation('student');
    const authUser = useRouteLoaderData("root");
    const studentId = authUser?.roles?.some((r) => r.toLowerCase().startsWith("student")) ? authUser?.userId : null;
    const initialData = mapAuthToUserData(authUser);

    const { data: userData = null, isLoading: detailedLoading, refetch, error } = useQuery({
        queryKey: ["studentProfile"],
        queryFn: async () => {
            const student = await fetchStudentProfile(studentId);
            return mapBackendToUserData(student);
        },
        staleTime: 10 * 60 * 1000,
        enabled: !!studentId,
        placeholderData: initialData,
    });

    if (!userData && !studentId) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('profile.unableToLoad')}</p>
            </div>
        );
    }

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_2fr] items-stretch">
                    <div className="flex h-full flex-col gap-6 lg:sticky lg:top-6 self-start">
                        <IdentityCard user={userData} onProfileUpdate={refetch} />
                        <AccountControlsCard className="shrink-0" />
                    </div>
                    <div className="flex h-full flex-col gap-6">
                        <AcademicInfoCard user={userData} loading={detailedLoading} />
                        <PerformanceCard user={userData} loading={detailedLoading} />
                    </div>
                </div>
            </div>
        </div>
    );
}
