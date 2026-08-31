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

import enStudentSpecialization from '../locales/en/student/specialization.json';
import arStudentSpecialization from '../locales/ar/student/specialization.json';

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

i18n.use(initReactI18next).init({
  resources: {
    en: {
      'auth/login': enAuthLogin,
      'auth/forgotPassword': enAuthForgotPassword,
      'auth/resetPassword': enAuthResetPassword,
      'auth/getCredentials': enAuthGetCredentials,
      'auth/firstTimeSetup': enAuthFirstTimeSetup,
      'auth/errors': enAuthErrors,
      'admin/aside': enAdminAside,
      'admin/dashboard': enAdminDashboard,
      'admin/courses': enAdminCourses,
      'admin/students': enAdminStudents,
      'admin/studentDetails': enAdminStudentDetails,
      'admin/instructors': enAdminInstructors,
      'admin/departments': enAdminDepartments,
      'admin/bylaws': enAdminBylaws,
      'admin/rooms': enAdminRooms,
      'admin/exams': enAdminExams,
      'admin/electiveBuckets': enAdminElectiveBuckets,
      'admin/manage': enAdminManage,
      'admin/forms': enAdminForms,
      'admin/profile': enAdminProfile,
      'instructor/aside': enInstructorAside,
      'instructor/dashboard': enInstructorDashboard,
      'instructor/courses': enInstructorCourses,
      'instructor/assignments': enInstructorAssignments,
      'instructor/attendance': enInstructorAttendance,
      'instructor/quizzes': enInstructorQuizzes,
      'instructor/complaints': enInstructorComplaints,
      'instructor/grades': enInstructorGrades,
      'instructor/meeting': enInstructorMeeting,
      'instructor/profile': enInstructorProfile,
      'instructor/reminders': enInstructorReminders,
      'instructor/analytics': enInstructorAnalytics,
      'instructor/schedule': enInstructorSchedule,
      'student/aside': enStudentAside,
      'student/dashboard': enStudentDashboard,
      'student/courses': enStudentCourses,
      'student/registration': enStudentRegistration,
      'student/schedule': enStudentSchedule,
      'student/reminders': enStudentReminders,
      'student/smartNotes': enStudentSmartNotes,
      'student/academicProgress': enStudentAcademicProgress,
      'student/specialization': enStudentSpecialization,
      'student/profile': enStudentProfile,
      'common/labels': enCommonLabels,
      'common/errors': enCommonErrors,
      'chat': enChat,
      'ui': enUiCommonUi,
    },
    ar: {
      'auth/login': arAuthLogin,
      'auth/forgotPassword': arAuthForgotPassword,
      'auth/resetPassword': arAuthResetPassword,
      'auth/getCredentials': arAuthGetCredentials,
      'auth/firstTimeSetup': arAuthFirstTimeSetup,
      'auth/errors': arAuthErrors,
      'admin/aside': arAdminAside,
      'admin/dashboard': arAdminDashboard,
      'admin/courses': arAdminCourses,
      'admin/students': arAdminStudents,
      'admin/studentDetails': arAdminStudentDetails,
      'admin/instructors': arAdminInstructors,
      'admin/departments': arAdminDepartments,
      'admin/bylaws': arAdminBylaws,
      'admin/rooms': arAdminRooms,
      'admin/exams': arAdminExams,
      'admin/electiveBuckets': arAdminElectiveBuckets,
      'admin/manage': arAdminManage,
      'admin/forms': arAdminForms,
      'admin/profile': arAdminProfile,
      'instructor/aside': arInstructorAside,
      'instructor/dashboard': arInstructorDashboard,
      'instructor/courses': arInstructorCourses,
      'instructor/assignments': arInstructorAssignments,
      'instructor/attendance': arInstructorAttendance,
      'instructor/quizzes': arInstructorQuizzes,
      'instructor/complaints': arInstructorComplaints,
      'instructor/grades': arInstructorGrades,
      'instructor/meeting': arInstructorMeeting,
      'instructor/profile': arInstructorProfile,
      'instructor/reminders': arInstructorReminders,
      'instructor/analytics': arInstructorAnalytics,
      'instructor/schedule': arInstructorSchedule,
      'student/aside': arStudentAside,
      'student/dashboard': arStudentDashboard,
      'student/courses': arStudentCourses,
      'student/registration': arStudentRegistration,
      'student/schedule': arStudentSchedule,
      'student/reminders': arStudentReminders,
      'student/smartNotes': arStudentSmartNotes,
      'student/academicProgress': arStudentAcademicProgress,
      'student/specialization': arStudentSpecialization,
      'student/profile': arStudentProfile,
      'common/labels': arCommonLabels,
      'common/errors': arCommonErrors,
      'chat': arChat,
      'ui': arUiCommonUi,
    },
  },
  lng: localStorage.getItem("lang") || "en",
  fallbackLng: 'en',
  debug: true,
  defaultNS: 'student/aside',
  interpolation: {
    escapeValue: false,
  }
});

i18n.on("languageChanged", (lng) => {
    document.documentElement.dir = lng === "ar" ? "rtl" : "ltr"
})

export default i18n;
