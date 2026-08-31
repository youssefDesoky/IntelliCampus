import apiClient from "../../../api/apiClient";

export async function fetchStudents() {
    const result = await apiClient('/api/students?PageSize=50');
    return result?.data ?? result ?? [];
}

export async function fetchStudentById(id) {
    return apiClient(`/api/students/${id}`);
}

export async function createStudent(data) {
    return apiClient('/api/students', {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateStudent(id, data) {
    return apiClient(`/api/students/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteStudent(id) {
    await apiClient(`/api/students/${id}`, { method: "DELETE" });
}

export async function fetchStudentRegisteredCourses(studentId) {
    const result = await apiClient(`/api/Courses/student/${studentId}?status=inprogress&PageSize=50`);
    return result?.data ?? result ?? [];
}

export async function fetchStudentCompletedCourses(studentId) {
    const result = await apiClient(`/api/Courses/student/${studentId}?status=completed&PageSize=50`);
    return result?.data ?? result ?? [];
}

export async function fetchAvailableCoursesForStudent(studentId) {
    const result = await apiClient('/api/Courses/active?PageSize=50');
    return result?.data ?? result ?? [];
}

export async function registerStudentCourse(studentId, courseId, classId = null) {
    const payload = { courseId: Number(courseId) };
    if (classId) {
        payload.classId = Number(classId);
    }
    return await apiClient(`/api/Students/${studentId}/register`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function unregisterStudentCourse(studentId, courseId) {
    await apiClient(`/api/Students/${studentId}/courses/${courseId}`, { method: "DELETE" });
    return true;
}

export async function fetchStudentCourseSections(studentId, courseId) {
    return await apiClient(`/api/Classes/course/${courseId}`);
}

export async function changeStudentCourseSection(studentId, courseId, classId) {
    return await apiClient(`/api/Students/${studentId}/courses/${courseId}/section`, {
        method: "PATCH",
        body: JSON.stringify({ classId: Number(classId) }),
    });
}

export async function fetchStudentTypes() {
    return apiClient('/api/students/types');
}
