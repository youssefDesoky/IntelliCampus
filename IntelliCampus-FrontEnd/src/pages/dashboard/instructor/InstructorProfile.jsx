import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouteLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../../config/api";
import { InstructorProfileSkeleton } from "../../../feature/instructor/SkeletonLoader";
import AccountControlsCard from "../../../feature/student/profile/AccountControlsCard";
import InstructorIdentityCard from "../../../feature/instructor/profile/InstructorIdentityCard";
import ProfessionalInfoCard from "../../../feature/instructor/profile/ProfessionalInfoCard";
import OfficeHoursCard from "../../../feature/instructor/profile/OfficeHoursCard";
import { getLocalizedField } from '../../../utils/getLocalizedField';
import { formatHireDate } from "../../../utils/formatDate";
import useArabicDigits from '../../../hooks/useArabicDigits.js';

export default function InstructorProfile() {
    const { t, i18n } = useTranslation('instructor');
    const { convert: ar } = useArabicDigits();
    const authUser = useRouteLoaderData("root");

    const { data: rawProfile, isLoading: profileLoading, refetch } = useQuery({
        queryKey: ["instructorProfile"],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                credentials: "include",
            });
            if (!res.ok) return null;
            const profile = await res.json();
            return profile;
        },
        staleTime: 10 * 60 * 1000,
    });

    const userData = useMemo(() => {
        const profile = rawProfile ?? authUser;
        if (!profile) return null;
        const joinedDate = formatHireDate(profile.hireDate || profile.HireDate);
        return {
            name: getLocalizedField(profile, 'fullName', i18n.language) || "",
            fullName: getLocalizedField(profile, 'fullName', i18n.language) || "",
            avatar: profile.profileImage || "",
            department: getLocalizedField(profile, 'departmentName', i18n.language) || "",
            faculty: getLocalizedField(profile, 'facultyName', i18n.language) || "",
            email: profile.email || "",
            phone: profile.phoneNumber || "",
            address: getLocalizedField(profile, 'address', i18n.language) || "",
            instructorCode: profile.instructorCode || "",
            nationality: profile.nationality || "",
            role: profile.instructorRole || "",
            joinedDate,
            facultyName: getLocalizedField(profile, 'facultyName', i18n.language) || "",
            officeHoursRoom: getLocalizedField(profile, 'officeHoursRoomName', i18n.language) || "",
            officeHoursLocation: getLocalizedField(profile, 'officeHoursRoomLocation', i18n.language) || "",
        };
    }, [rawProfile, authUser, i18n.language]);

    if (profileLoading) {
        return <InstructorProfileSkeleton />;
    }

    if (!userData && !authUser) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('profile.error')}</p>
            </div>
        );
    }

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6">
            <div className="mx-auto max-w-7xl space-y-6">
                {/* Mobile layout: personal → professional → office hours → account controls */}
                <div className="flex flex-col gap-6 lg:hidden">
                    <InstructorIdentityCard user={userData} onProfileUpdate={refetch} />
                    <ProfessionalInfoCard user={userData} loading={profileLoading} />
                    <OfficeHoursCard user={userData} />
                    <AccountControlsCard className="shrink-0" />
                </div>
                {/* Large layout: left col (identity + account), right col (professional + office hours) */}
                <div className="hidden lg:grid grid-cols-[1fr_2fr] gap-6 items-stretch">
                    <div className="flex h-full flex-col gap-6 sticky top-6 self-start">
                        <InstructorIdentityCard user={userData} onProfileUpdate={refetch} />
                        <AccountControlsCard className="shrink-0" />
                    </div>
                    <div className="flex h-full flex-col gap-6">
                        <ProfessionalInfoCard user={userData} loading={profileLoading} />
                        <OfficeHoursCard user={userData} />
                    </div>
                </div>
            </div>
        </div>
    );
}
