import { useRouteLoaderData } from "react-router-dom";
import StudentProfile from "./student/Profile";
import InstructorProfile from "./instructor/InstructorProfile";
import AdminProfile from "./admin/AdminProfile";

function resolvePrimaryRole(roles) {
    const r = (roles || []).map(x => x.toLowerCase());
    if (r.some(x => x.startsWith('admin') || x === 'superadmin')) return 'admin';
    if (r.some(x => x === 'instructor')) return 'instructor';
    if (r.some(x => x.startsWith('student'))) return 'student';
    return null;
}

export default function Profile() {
    const user = useRouteLoaderData("root");
    const role = resolvePrimaryRole(user?.roles);

    switch (role) {
        case 'instructor':
            return <InstructorProfile />;
        case 'admin':
            return <AdminProfile />;
        case 'student':
        default:
            return <StudentProfile />;
    }
}
