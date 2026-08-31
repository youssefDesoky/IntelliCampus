export const kpiData = [
 {
 id: 1,
 title: "Total Students",
 value: 1560,
 trend: { value: 12.5, isUp: true },
 icon: "users",
 color: "blue",
 },
 {
 id: 2,
 title: "Active Courses",
 value: 79,
 trend: { value: 4.2, isUp: true },
 icon: "book",
 color: "amber",
 },
 {
 id: 3,
 title: "Faculty Members",
 value: 85,
 trend: { value: 2.1, isUp: true },
 icon: "userTie",
 color: "green",
 },
 {
 id: 4,
 title: "Attendance Rate",
 value: "87%",
 trend: { value: 3.8, isUp: false },
 icon: "chartLine",
 color: "purple",
 },
 {
 id: 5,
 title: "Pending Requests",
 value: 23,
 trend: { value: 8.3, isUp: true },
 icon: "clipboardCheck",
 color: "red",
 },
];

export const studentsPerDepartmentData = [
 { department: "Computer Science", students: 520 },
 { department: "Engineering", students: 380 },
 { department: "Business", students: 290 },
 { department: "Psychology", students: 175 },
 { department: "Mathematics", students: 135 },
 { department: "English", students: 60 },
];

export const enrollmentTrendData = [
 { semester: "Fall 2023", students: 1200, capacity: 1500 },
 { semester: "Spring 2024", students: 1350, capacity: 1500 },
 { semester: "Fall 2024", students: 1420, capacity: 1600 },
 { semester: "Spring 2025", students: 1480, capacity: 1600 },
 { semester: "Fall 2025", students: 1560, capacity: 1800 },
 { semester: "Spring 2026", students: 1620, capacity: 1800 },
];

export const attendanceRateData = [
 { month: "Sep", rate: 88 },
 { month: "Oct", rate: 85 },
 { month: "Nov", rate: 90 },
 { month: "Dec", rate: 82 },
 { month: "Jan", rate: 78 },
 { month: "Feb", rate: 86 },
 { month: "Mar", rate: 91 },
 { month: "Apr", rate: 87 },
];

export const requestsStatusData = [
 { status: "Pending", count: 23 },
 { status: "Approved", count: 156 },
 { status: "Rejected", count: 12 },
];

export const facultyWorkloadData = [
 { name: "Dr. Smith", courses: 4, students: 120 },
 { name: "Dr. Johnson", courses: 3, students: 95 },
 { name: "Dr. Williams", courses: 5, students: 180 },
 { name: "Dr. Brown", courses: 2, students: 60 },
 { name: "Dr. Jones", courses: 4, students: 140 },
 { name: "Dr. Garcia", courses: 3, students: 110 },
];

export const alertsData = [
 {
 id: 1,
 type: "danger",
 title: "Low GPA Warning",
 description: "12 students have GPA below 2.0",
 action: "View Students",
 actionLink: "/admin/students",
 },
 {
 id: 2,
 type: "warning",
 title: "High Absence Alert",
 description: "8 students have absence rate above 25%",
 action: "View Attendance",
 actionLink: "/admin/analytics",
 },
 {
 id: 3,
 type: "danger",
 title: "Overloaded Courses",
 description: "CS301, MATH201 exceeded maximum capacity",
 action: "Manage Courses",
 actionLink: "/admin/courses",
 },
 {
 id: 4,
 type: "warning",
 title: "Upcoming Exams",
 description: "3 exams scheduled for next week",
 action: "View Schedule",
 actionLink: "/admin/exams",
 },
 {
 id: 5,
 type: "info",
 title: "Pending Approvals",
 description: "5 course registration requests awaiting review",
 action: "Review",
 actionLink: "/admin/courses",
 },
];

export const superAdminSpecificData = {
 totalDepartments: 6,
 totalAdmins: 12,
 systemUptime: "99.9%",
 activeUsers: 1657,
};

export const scopedAdminData = {
 totalDepartments: 2,
 totalAdmins: 4,
 systemUptime: "99.9%",
 activeUsers: 320,
};
