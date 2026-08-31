import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { useRouteLoaderData } from "react-router-dom";
import AccountControlsCard from "../../../feature/student/profile/AccountControlsCard";
import AdminIdentityCard from "../../../feature/admin/profile/AdminIdentityCard";
import { fetchAdminProfile } from "../../../feature/admin/services/profileApi";

function mapBackendToUserData(admin) {
    return {
        name: admin.fullName,
        fullName: admin.fullName,
        avatar: admin.profileImage || "",
        email: admin.email || "",
        phone: admin.phoneNumber || "",
        address: admin.address || "",
        adminCode: admin.adminCode || admin.adminId || "",
        adminId: admin.adminId || admin.id || "",
        id: admin.id || admin._id || "",
        role: admin.adminRole || admin.role || "",
        roles: admin.roles || [],
        department: admin.departmentName || admin.department || "",
        faculty: admin.facultyName || admin.faculty || "",
        nationality: admin.nationality || "",
    };
}

function mapAuthToUserData(auth) {
    if (!auth) return null;
    return {
        name: auth.fullName || auth.name || "",
        fullName: auth.fullName || auth.name || "",
        avatar: auth.profileImage || "",
        email: auth.email || "",
        phone: auth.phoneNumber || auth.phone || "",
        address: auth.address || "",
        adminCode: auth.adminCode || auth.adminId || "",
        adminId: auth.adminId || auth.id || "",
        id: auth.id || auth._id || "",
        role: auth.adminRole || auth.role || "",
        roles: auth.roles || [],
        department: auth.departmentName || auth.department || "",
        faculty: auth.facultyName || auth.faculty || "",
        nationality: auth.nationality || "",
    };
}

export default function AdminProfile() {
    const { t } = useTranslation('admin');
    const authUser = useRouteLoaderData("root");
    const adminId = authUser?.userId;
    const initialData = mapAuthToUserData(authUser);

    const { data: userData, refetch } = useQuery({
        queryKey: ["adminProfile", adminId],
        queryFn: async () => {
            const admin = await fetchAdminProfile(adminId);
            return mapBackendToUserData(admin);
        },
        staleTime: 10 * 60 * 1000,
        enabled: !!adminId,
        placeholderData: initialData,
    });

    if (!userData && !adminId) {
        return (
            <div className="flex items-center justify-center py-20">
                <p className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('profile.unableToLoad')}</p>
            </div>
        );
    }

    return (
        <div className="px-4 lg:px-8 py-6 space-y-6">
            <div className="mx-auto max-w-7xl space-y-6">
                <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
                    <AdminIdentityCard user={userData} onProfileUpdate={refetch} />
                    <AccountControlsCard />
                </div>
            </div>
        </div>
    );
}
