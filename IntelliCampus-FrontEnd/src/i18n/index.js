import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import enAuthLogin from '../locales/en/auth/login.json';
import arAuthLogin from '../locales/ar/auth/login.json';

import enAuthForgotPassword from '../locales/en/auth/forgotPassword.json';
import arAuthForgotPassword from '../locales/ar/auth/forgotPassword.json';

import enAuthResetPassword from '../locales/en/auth/resetPassword.json';
import arAuthResetPassword from '../locales/ar/auth/resetPassword.json';

import enAuthGetCredentials from '../locales/en/auth/getCredentials.json';
import arAuthGetCredentials from '../locales/ar/auth/getCredentials.json';

import enAuthFirstTimeSetup from '../locales/en/auth/firstTimeSetup.json';
import arAuthFirstTimeSetup from '../locales/ar/auth/firstTimeSetup.json';

import enAuthLabels from '../locales/en/auth/labels.json';
import arAuthLabels from '../locales/ar/auth/labels.json';

import enAuthErrors from '../locales/en/auth/errors.json';
import arAuthErrors from '../locales/ar/auth/errors.json';

import enAdminAside from '../locales/en/admin/aside.json';
import arAdminAside from '../locales/ar/admin/aside.json';

import enAdminDashboard from '../locales/en/admin/dashboard.json';
import arAdminDashboard from '../locales/ar/admin/dashboard.json';

import enAdminCourses from '../locales/en/admin/courses.json';
import arAdminCourses from '../locales/ar/admin/courses.json';

import enAdminStudents from '../locales/en/admin/students.json';
import arAdminStudents from '../locales/ar/admin/students.json';

import enAdminStudentDetails from '../locales/en/admin/studentDetails.json';
import arAdminStudentDetails from '../locales/ar/admin/studentDetails.json';

import enAdminInstructors from '../locales/en/admin/instructors.json';
import arAdminInstructors from '../locales/ar/admin/instructors.json';

import enAdminDepartments from '../locales/en/admin/departments.json';
import arAdminDepartments from '../locales/ar/admin/departments.json';

import enAdminBylaws from '../locales/en/admin/bylaws.json';
import arAdminBylaws from '../locales/ar/admin/bylaws.json';

import enAdminRooms from '../locales/en/admin/rooms.json';
import arAdminRooms from '../locales/ar/admin/rooms.json';

import enAdminExams from '../locales/en/admin/exams.json';
import arAdminExams from '../locales/ar/admin/exams.json';

import enAdminElectiveBuckets from '../locales/en/admin/electiveBuckets.json';
import arAdminElectiveBuckets from '../locales/ar/admin/electiveBuckets.json';

import enAdminManage from '../locales/en/admin/manage.json';
import arAdminManage from '../locales/ar/admin/manage.json';

import enAdminForms from '../locales/en/admin/forms.json';
import arAdminForms from '../locales/ar/admin/forms.json';

import enAdminProfile from '../locales/en/admin/profile.json';
import arAdminProfile from '../locales/ar/admin/profile.json';

import enInstructorAside from '../locales/en/instructor/aside.json';
import arInstructorAside from '../locales/ar/instructor/aside.json';

import enInstructorDashboard from '../locales/en/instructor/dashboard.json';
import arInstructorDashboard from '../locales/ar/instructor/dashboard.json';

import enInstructorCourses from '../locales/en/instructor/courses.json';
import arInstructorCourses from '../locales/ar/instructor/courses.json';

import enInstructorAssignments from '../locales/en/instructor/assignments.json';
import arInstructorAssignments from '../locales/ar/instructor/assignments.json';

import enInstructorAttendance from '../locales/en/instructor/attendance.json';
import arInstructorAttendance from '../locales/ar/instructor/attendance.json';

import enInstructorQuizzes from '../locales/en/instructor/quizzes.json';
import arInstructorQuizzes from '../locales/ar/instructor/quizzes.json';

import enInstructorComplaints from '../locales/en/instructor/complaints.json';
import arInstructorComplaints from '../locales/ar/instructor/complaints.json';

import enInstructorGrades from '../locales/en/instructor/grades.json';
import arInstructorGrades from '../locales/ar/instructor/grades.json';

import enInstructorMeeting from '../locales/en/instructor/meeting.json';
import arInstructorMeeting from '../locales/ar/instructor/meeting.json';

import enInstructorProfile from '../locales/en/instructor/profile.json';
import arInstructorProfile from '../locales/ar/instructor/profile.json';

import enInstructorReminders from '../locales/en/instructor/reminders.json';
import arInstructorReminders from '../locales/ar/instructor/reminders.json';

import enInstructorAnalytics from '../locales/en/instructor/analytics.json';
import arInstructorAnalytics from '../locales/ar/instructor/analytics.json';

import enInstructorSchedule from '../locales/en/instructor/schedule.json';
import arInstructorSchedule from '../locales/ar/instructor/schedule.json';

import enStudentAside from '../locales/en/student/aside.json';
import arStudentAside from '../locales/ar/student/aside.json';

import enStudentDashboard from '../locales/en/student/dashboard.json';
import arStudentDashboard from '../locales/ar/student/dashboard.json';

import enStudentCourses from '../locales/en/student/courses.json';
import arStudentCourses from '../locales/ar/student/courses.json';

import enStudentRegistration from '../locales/en/student/registration.json';
import arStudentRegistration from '../locales/ar/student/registration.json';

import enStudentSchedule from '../locales/en/student/schedule.json';
import arStudentSchedule from '../locales/ar/student/schedule.json';

import enStudentReminders from '../locales/en/student/reminders.json';
import arStudentReminders from '../locales/ar/student/reminders.json';

import enStudentSmartNotes from '../locales/en/student/smartNotes.json';
import arStudentSmartNotes from '../locales/ar/student/smartNotes.json';

import enStudentAcademicProgress from '../locales/en/student/academicProgress.json';
import arStudentAcademicProgress from '../locales/ar/student/academicProgress.json';

import enStudentDepartmentPreference from '../locales/en/student/departmentPreference.json';
import arStudentDepartmentPreference from '../locales/ar/student/departmentPreference.json';

import enStudentProfile from '../locales/en/student/profile.json';
import arStudentProfile from '../locales/ar/student/profile.json';

import enCommonLabels from '../locales/en/common/labels.json';
import arCommonLabels from '../locales/ar/common/labels.json';

import enCommonErrors from '../locales/en/common/errors.json';
import arCommonErrors from '../locales/ar/common/errors.json';

import enChat from '../locales/en/chat/chat.json';
import arChat from '../locales/ar/chat/chat.json';

import enUiCommonUi from '../locales/en/ui/common-ui.json';
import arUiCommonUi from '../locales/ar/ui/common-ui.json';

// Merge all sub-namespace JSONs into flat parent namespaces
const enAuth = Object.assign({}, enAuthLogin, enAuthForgotPassword, enAuthResetPassword, enAuthGetCredentials, enAuthFirstTimeSetup, enAuthLabels, enAuthErrors);
const arAuth = Object.assign({}, arAuthLogin, arAuthForgotPassword, arAuthResetPassword, arAuthGetCredentials, arAuthFirstTimeSetup, arAuthLabels, arAuthErrors);

const enAdmin = Object.assign({}, enAdminAside, enAdminDashboard, enAdminCourses, enAdminStudents, enAdminStudentDetails, enAdminInstructors, enAdminDepartments, enAdminBylaws, enAdminRooms, enAdminExams, enAdminElectiveBuckets, enAdminManage, enAdminForms, enAdminProfile);
const arAdmin = Object.assign({}, arAdminAside, arAdminDashboard, arAdminCourses, arAdminStudents, arAdminStudentDetails, arAdminInstructors, arAdminDepartments, arAdminBylaws, arAdminRooms, arAdminExams, arAdminElectiveBuckets, arAdminManage, arAdminForms, arAdminProfile);

const enInstructor = Object.assign({}, enInstructorAside, enInstructorDashboard, enInstructorCourses, enInstructorAssignments, enInstructorAttendance, enInstructorQuizzes, enInstructorComplaints, enInstructorGrades, enInstructorMeeting, enInstructorProfile, enInstructorReminders, enInstructorAnalytics, enInstructorSchedule);
const arInstructor = Object.assign({}, arInstructorAside, arInstructorDashboard, arInstructorCourses, arInstructorAssignments, arInstructorAttendance, arInstructorQuizzes, arInstructorComplaints, arInstructorGrades, arInstructorMeeting, arInstructorProfile, arInstructorReminders, arInstructorAnalytics, arInstructorSchedule);

const enStudent = Object.assign({}, enStudentAside, enStudentDashboard, enStudentCourses, enStudentRegistration, enStudentSchedule, enStudentReminders, enStudentSmartNotes, enStudentAcademicProgress, enStudentDepartmentPreference, enStudentProfile);
const arStudent = Object.assign({}, arStudentAside, arStudentDashboard, arStudentCourses, arStudentRegistration, arStudentSchedule, arStudentReminders, arStudentSmartNotes, arStudentAcademicProgress, arStudentDepartmentPreference, arStudentProfile);

const enCommon = Object.assign({}, enCommonLabels, enCommonErrors);
const arCommon = Object.assign({}, arCommonLabels, arCommonErrors);

i18n.use(initReactI18next).init({
  resources: {
    en: {
      auth: enAuth,
      admin: enAdmin,
      instructor: enInstructor,
      student: enStudent,
      common: enCommon,
      chat: enChat,
      ui: enUiCommonUi,
    },
    ar: {
      auth: arAuth,
      admin: arAdmin,
      instructor: arInstructor,
      student: arStudent,
      common: arCommon,
      chat: arChat,
      ui: arUiCommonUi,
    },
  },
  lng: localStorage.getItem("lang") || "en",
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  }
});

i18n.on("languageChanged", (lng) => {
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr"
})

export default i18n;
