import { useQuery } from "@tanstack/react-query";
import { useRouteLoaderData } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { API_URL } from "../../../config/api";
import { InstructorProfileSkeleton } from "../../../feature/instructor/SkeletonLoader";
import AccountControlsCard from "../../../feature/student/profile/AccountControlsCard";
import InstructorIdentityCard from "../../../feature/instructor/profile/InstructorIdentityCard";
import ProfessionalInfoCard from "../../../feature/instructor/profile/ProfessionalInfoCard";
import OfficeHoursCard from "../../../feature/instructor/profile/OfficeHoursCard";

function mapProfileToUserData(profile) {
    if (!profile) return null;
    return {
        name: profile.fullName || "",
        fullName: profile.fullName || "",
        avatar: profile.profileImage || "",
        specialization: profile.specialization || "",
        department: profile.departmentName || "",
        faculty: profile.facultyName || "",
        email: profile.email || "",
        phone: profile.phoneNumber || "",
        address: profile.address || "",
        instructorCode: profile.instructorCode || "",
        nationality: profile.nationality || "",
        role: profile.instructorRole || "",
        joinedDate: profile.hireDate || "",
        facultyName: profile.facultyName || "",
        officeHoursRoom: profile.officeHoursRoomName || "",
        officeHoursLocation: profile.officeHoursRoomLocation || "",
    };
}

export default function InstructorProfile() {
    const { t } = useTranslation('instructor');
    const authUser = useRouteLoaderData("root");
    const initialData = mapProfileToUserData(authUser);

    const { data: userData, isLoading: profileLoading, refetch } = useQuery({
        queryKey: ["instructorProfile"],
        queryFn: async () => {
            const res = await fetch(`${API_URL}/api/auth/profile`, {
                credentials: "include",
            });
            if (!res.ok) return initialData;
            const profile = await res.json();
            return mapProfileToUserData(profile);
        },
        staleTime: 10 * 60 * 1000,
    });

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
