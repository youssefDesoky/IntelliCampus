import { useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import AppLayout from "./layout/AppLayout";

import { RoleGuard } from "./routes/guards";
import { rootAuthLoader } from "./routes/loaders";
import { authAction, logoutAction } from "./routes/actions";

import CustomCursor from "./components/ui/CustomCursor";
import { ContextMenuProvider } from "./components/ui/ContextMenu";
import SidebarProvider from "./contexts/SidebarProvider";
import CourseShell from "./feature/course/component/CourseShell";

// Auth Pages
import { LoginPage, ForgetPassword, ResetPassword, GetCredentials, FirstTimeSetup, UnauthorizedPage, InternalServerErrorPage, ResourceNotFoundPage } from "./pages/auth";

// Profile (shared across all roles)
import Profile from "./pages/dashboard/Profile";

// Shared Pages (all authenticated users)
import { Inbox, ComposeMessage, MessageDetail } from "./pages/dashboard/shared";

// Student Pages
import { 
    Schedule as StudentSchedule,
    MyCourses as StudentCourses,
    Dashboard as StudentDashboard, 
    Reminders as StudentReminders,
    StudyGroup as StudentStudyGroup, 
    StudyGroupPostDetail as StudentStudyGroupPostDetail,
    SmartNotes as StudentSmartNotes, 
    CourseMaterials as StudentCourseMaterials, 
    CoursePrerequisites as StudentCoursePrerequisites, 
    CoursesRegistration as StudentCoursesRegistration,
    SpecializationPreference as StudentSpecializationPreference,
    AcademicProgress as StudentAcademicProgress,
    Transcript as StudentTranscript,
} from "./pages/dashboard/student";

import CourseAttendance from "./feature/student/courses/courseDetail/courseAttendance/CourseAttendance";
import CourseAssignments from "./feature/student/courses/courseDetail/assignments/CourseAssignments";
import CourseGrade from "./feature/student/courses/courseDetail/grade/CourseGrade";
import CourseQuizzes from "./feature/student/courses/courseDetail/quizzes/CourseQuizzes";
import CourseQuizPractice from "./feature/student/courses/courseDetail/quizzes/CourseQuizPractice";
import CourseAnnouncements from "./feature/student/courses/courseDetail/announcements/CourseAnnouncements";

// Admin Pages
import { Dashboard as AdminDashboard, ManageInstructors, ManageStudents, StudentDetails, InstructorDetails, ManageAdmins, ManageCourses, ManageCourseClasses, ManageRooms, ManageDepartments, ManageBylaws, ManageBylawDetailsPage, ManageExams } from "./pages/dashboard/admin";

// Instructor Pages
import Attendance from "./feature/instructor/components/attendance/Attendance"
import { InstructorCourses, InstructorCourseMaterials, InstructorCourseAssignments, InstructorCourseAttendance, InstructorCourseQuizzes, InstructorCourseGrades, InstructorCourseComplaints, InstructorCourseExcuses, InstructorCourseAnalytics, InstructorReminders, InstructorSchedule, InstructorDashboard } from "./pages/dashboard/instructor"
import { InstructorCourseAnnouncements } from "./feature/instructor/components/courseAnnouncements"
import { InstructorMeetingRoom } from "./pages/dashboard/instructor"
import InstructorCommunity from "./feature/student/courses/courseDetail/community/MyCommunities"


export default function App() {    
    const { i18n } = useTranslation();

    useLayoutEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
            document.documentElement.setAttribute("data-theme", savedTheme);
            if (savedTheme === "dark") {
                document.getElementById("dark-mode-btn")?.classList.add("hidden");
                document.getElementById("light-mode-btn")?.classList.remove("hidden");
            } else {
                document.getElementById("light-mode-btn")?.classList.add("hidden");
                document.getElementById("dark-mode-btn")?.classList.remove("hidden");
            }
        }
    }, []);

    useLayoutEffect(() => {
        document.documentElement.dir = i18n.language === "ar" ? "rtl" : "ltr";
    }, [i18n.language]);

    const router = createBrowserRouter([
    {
        id: "root", // 🔑 REQUIRED
        loader: rootAuthLoader,
        element: <AppLayout />,
        children: [
            // ================= SHARED (all authenticated users) =================
            { path: "profile", element: <Profile /> },
            { path: "inbox", element: <Inbox /> },
            { path: "inbox/compose", element: <ComposeMessage /> },
            { path: "inbox/:messageId", element: <MessageDetail /> },

            // ================= STUDENT =================
            {
                element: <RoleGuard allow={["student_bachelor", "student_masters", "student_phd", "student_diploma", "student"]} />,
                children: [
                    { index: true, element: <StudentDashboard /> },
                    { path: "fahim", element: <div>Fahim AI Content</div> },
                    { path: "courses", element: <StudentCourses /> },

                    {
                        path: "courses/:courseId/*",
                        element: <CourseShell />,
                        children: [
                            { index: true, element: <CourseAnnouncements /> },
                            { path: "materials", element: <StudentCourseMaterials /> },
                            { path: "assignments", element: <CourseAssignments /> },
                            { path: "quizzes", element: <CourseQuizzes /> },
                            { path: "quizzes/practice", element: <CourseQuizPractice /> },
                            { path: "attendance", element: <CourseAttendance /> },
                            { path: "grades", element: <CourseGrade /> },
                            { path: "community", element: <StudentStudyGroup /> },
                            { path: "community/questions/:postId", element: <StudentStudyGroupPostDetail /> },
                            { path: "smart-notes", element: <StudentSmartNotes /> },
                            { path: "meeting", element: <InstructorMeetingRoom /> },
                        ],
                    },

                    { path: "courses/registration", element: <StudentCoursesRegistration /> },
                    { path: "courses/prerequisites", element: <StudentCoursePrerequisites /> },
                    { path: "courses/transcript", element: <StudentTranscript /> },
                    { path: "courses/academic-progress", element: <StudentAcademicProgress /> },
                    { path: "reminders", element: <StudentReminders /> },
                    { path: "smart-notes", element: <StudentSmartNotes /> },
                    { path: "schedule", element: <StudentSchedule /> },
                    { path: "specialization-preference", element: <StudentSpecializationPreference /> },
                ],
            },

            // ================= INSTRUCTOR =================
            {
                path: "instructor",
                element: <RoleGuard allow={["instructor"]} />,
                children: [
                    { index: true, element: <InstructorDashboard /> },
                    { path: "reminders", element: <InstructorReminders /> },
                    { path: "schedule", element: <InstructorSchedule /> },
                    { path: "courses", element: <InstructorCourses /> },

                    {
                        path: "courses/:courseId/*", 
                        element: <CourseShell />,
                        children: [
                            { index: true, element: <InstructorCourseAnnouncements /> },
                            { path: "materials", element: <InstructorCourseMaterials /> },
                            { path: "assignments", element: <InstructorCourseAssignments /> },
                            { path: "quizzes", element: <InstructorCourseQuizzes /> },
                            { path: "attendance", element: <InstructorCourseAttendance /> },
                            { path: "attendance/:sessionId", element: <InstructorCourseAttendance /> },
                            { path: "attendance/excuses", element: <InstructorCourseExcuses /> },
                            { path: "grades", element: <InstructorCourseGrades /> },
                            { path: "grades/complaints", element: <InstructorCourseComplaints /> },
                            { path: "community", element: <InstructorCommunity /> },
                            { path: "community/questions/:postId", element: <StudentStudyGroupPostDetail /> },
                            { path: "smart-notes", element: <StudentSmartNotes /> },
                            { path: "analytics", element: <InstructorCourseAnalytics /> },
                            { path: "meeting", element: <InstructorMeetingRoom /> },
                        ],
                    },
                ],
            },

            // ================= ADMIN =================
            {
                path: "admin",
                children: [
                    // Dashboard — all admin roles
                    {
                        element: <RoleGuard allow={["superadmin", "admin_bachelor", "admin_masters", "admin_postgrad", "admin_phd", "admin_diploma", "admin_academicstaff"]} />,
                        children: [
                            { index: true, element: <AdminDashboard /> },
                        ],
                    },
                    // Analytics — superadmin only
                    {
                        element: <RoleGuard allow={["superadmin"]} />,
                        children: [
                            { path: "analytics", element: <Attendance /> },
                        ],
                    },
                    // Students — superadmin + student-type admins
                    {
                        element: <RoleGuard allow={["superadmin", "admin_bachelor", "admin_masters", "admin_postgrad", "admin_phd", "admin_diploma"]} />,
                        children: [
                            { path: "students", element: <ManageStudents /> },
                            { path: "students/:studentId", element: <StudentDetails /> },
                        ],
                    },
                    // Instructors — superadmin + academic staff
                    {
                        element: <RoleGuard allow={["superadmin", "admin_academicstaff"]} />,
                        children: [
                            { path: "instructors", element: <ManageInstructors /> },
                            { path: "instructors/:instructorId", element: <InstructorDetails /> },
                        ],
                    },
                    // Admins — superadmin only
                    {
                        element: <RoleGuard allow={["superadmin"]} />,
                        children: [
                            { path: "admins", element: <ManageAdmins /> },
                        ],
                    },
                    // SuperAdmin-only pages (departments, courses, rooms, bylaws, exams)
                    {
                        element: <RoleGuard allow={["superadmin"]} />,
                        children: [
                            { path: "departments", element: <ManageDepartments /> },
                            { path: "courses", element: <ManageCourses /> },
                            { path: "courses/:courseId", element: <ManageCourseClasses /> },
                            { path: "rooms", element: <ManageRooms /> },
                            { path: "bylaws", element: <ManageBylaws /> },
                            { path: "bylaws/:bylawId", element: <ManageBylawDetailsPage /> },
                            { path: "exams", element: <ManageExams /> },
                        ],
                    },
                ],
            },
        ],
    },

    // ================= PUBLIC =================
    { path: "/login", element: <LoginPage />, action: authAction },
    { path: "/forgot-password", element: <ForgetPassword /> },
    { path: "/reset-password", element: <ResetPassword /> },
    { path: "/get-credentials", element: <GetCredentials /> },
    { path: "/first-time-setup", element: <FirstTimeSetup /> },
    { path: "/unauthorized", element: <UnauthorizedPage /> },
    { path: "/internal-server-error", element: <InternalServerErrorPage /> },
    { path: "/resource-not-found", element: <ResourceNotFoundPage /> },
    { path: "/logout", action: logoutAction },
    ]);

    return (
        <ContextMenuProvider blockNative>
            <CustomCursor />
            <SidebarProvider>
                <RouterProvider router={router} />
            </SidebarProvider>
        </ContextMenuProvider>
    );
}