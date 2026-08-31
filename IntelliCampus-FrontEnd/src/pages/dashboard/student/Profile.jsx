import { useTranslation } from 'react-i18next';
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouteLoaderData } from "react-router-dom";
import IdentityCard from "../../../feature/student/profile/IdentityCard";
import AccountControlsCard from "../../../feature/student/profile/AccountControlsCard";
import AcademicInfoCard from "../../../feature/student/profile/AcademicInfoCard";
import PerformanceCard from "../../../feature/student/profile/PerformanceCard";
import { fetchStudentProfile } from "../../../api/studentProfile";
import { getLocalizedField } from '../../../utils/getLocalizedField';
export default function Profile() {
    const { t, i18n } = useTranslation('student');
    const authUser = useRouteLoaderData("root");
    const studentId = authUser?.roles?.some((r) => r.toLowerCase().startsWith("student")) ? authUser?.userId : null;

    const mapBackendToUserData = (student) => ({
        name: getLocalizedField(student, 'fullName', i18n.language),
        avatar: student.profileImage || "",
        department: getLocalizedField(student, 'departmentName', i18n.language) || "",
        faculty: getLocalizedField(student, 'facultyName', i18n.language) || "",
        studentSince: student.enrollmentDate || "",
        email: student.email || "",
        phone: student.phoneNumber || "",
        address: student.address || "",
        studentCode: student.studentCode || "",
        level: student.level,
        studentType: student.studentType || "",
        bylaw: getLocalizedField(student, 'bylawName', i18n.language) || "",
        gpa: student.gpa,
        isOnProbation: student.isOnProbation,
        probationThreshold: student.probationThreshold,
        courses: student.courses || [],
        qrCode: "",
        fullNameAr: student.fullNameAr || "",
    });

    const mapAuthToUserData = (auth) => {
        if (!auth) return null;
        return {
            name: getLocalizedField(auth, 'fullName', i18n.language) || auth.name || "",
            avatar: auth.profileImage || "",
            email: auth.email || "",
            phone: auth.phoneNumber || auth.phone || "",
            address: auth.address || "",
            department: getLocalizedField(auth, 'departmentName', i18n.language) || auth.department || "",
            faculty: getLocalizedField(auth, 'facultyName', i18n.language) || auth.facultyName || auth.faculty || "",
            studentSince: auth.enrollmentDate || "",
            studentCode: auth.studentCode || "",
            level: auth.level,
            studentType: auth.studentType || "",
            bylaw: getLocalizedField(auth, 'bylawName', i18n.language) || auth.bylawName || "",
            gpa: auth.gpa,
            isOnProbation: auth.isOnProbation,
            probationThreshold: auth.probationThreshold,
            courses: auth.courses || [],
            qrCode: "",
            fullNameAr: auth.fullNameAr || "",
        };
    };

    const { data: rawStudent = null, isLoading: detailedLoading, refetch, error } = useQuery({
        queryKey: ["studentProfile"],
        queryFn: async () => {
            const student = await fetchStudentProfile(studentId);
            return student;
        },
        staleTime: 10 * 60 * 1000,
        enabled: !!studentId,
    });

    const userData = useMemo(() => {
        if (rawStudent) return mapBackendToUserData(rawStudent);
        return mapAuthToUserData(authUser);
    }, [rawStudent, authUser, i18n.language]);

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
