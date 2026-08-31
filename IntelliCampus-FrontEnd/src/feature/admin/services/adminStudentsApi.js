import apiClient from "../../../api/apiClient";

export async function fetchStudents({ pageIndex = 1, pageSize = 50, searchQuery = '', filters = {} } = {}) {
    const params = new URLSearchParams({ PageIndex: pageIndex, PageSize: pageSize });
    if (searchQuery) params.set('Search', searchQuery);
    if (filters.status) params.set('Status', filters.status);
    if (filters.departmentId) params.set('DepartmentId', filters.departmentId);
    if (filters.probation === 'true' || filters.probation === true) params.set('IsOnProbation', 'true');
    else if (filters.probation === 'false' || filters.probation === false) params.set('IsOnProbation', 'false');
    const result = await apiClient(`/api/students?${params}`);
    return { data: result?.data ?? result ?? [], totalCount: result?.totalCount ?? 0 };
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

export async function fetchStudentAllCourses(studentId) {
    return await apiClient(`/api/Courses/student/${studentId}/all`);
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
    const result = await apiClient(`/api/Courses/active?PageSize=50&StudentId=${studentId}`);
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
