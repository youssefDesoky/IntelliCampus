import Header from "../components/navigation/base/Header";

import AdminAside from "../components/navigation/admin/AdminAside";
import InstructorAside from "../components/navigation/instructor/InstructorAside";
import StudentAside from "../components/navigation/student/StudentAside";

import AdminBottomBar from "../components/navigation/admin/AdminBottomBar";
import InstructorBottomBar from "../components/navigation/instructor/InstructorBottomBar";
import StudentBottomBar from "../components/navigation/student/StudentBottomBar";

export function getHeader(isMobile, isPhone, profileImage, notifications, roleViewProps) {
    return <Header isMobile={isMobile} isPhone={isPhone} avatar={profileImage} notifications={notifications} {...roleViewProps} />;
}

export function getAside(role, height) {
    switch (role?.toLowerCase()) {
        case "admin":
        case "superadmin": return <AdminAside height={height} />;
        case "instructor": return <InstructorAside height={height} />;
        case "student": return <StudentAside height={height} />;
        default: return null;
    }
}

export function getBottomBar(role, extraProps = {}) {
    switch (role?.toLowerCase()) {
        case "admin":
        case "superadmin": return <AdminBottomBar {...extraProps} />;
        case "instructor": return <InstructorBottomBar {...extraProps} />;
        case "student": return <StudentBottomBar {...extraProps} />;
        default: return null;
    }
}
