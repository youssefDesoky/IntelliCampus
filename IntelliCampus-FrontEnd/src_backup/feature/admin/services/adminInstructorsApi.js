import apiClient from "../../../api/apiClient";

export async function fetchInstructors() {
    const result = await apiClient('/api/instructors?PageSize=50');
    return result?.data ?? result ?? [];
}

export async function fetchInstructorById(id) {
    return apiClient(`/api/instructors/${id}`);
}

export async function updateInstructor(id, data) {
    return apiClient(`/api/instructors/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function createInstructor(data) {
    return apiClient('/api/instructors', {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteInstructor(id) {
    await apiClient(`/api/instructors/${id}`, { method: "DELETE" });
    return true;
}

export async function fetchProfessorsByDepartment(departmentId) {
    const params = new URLSearchParams({ departmentId });
    return apiClient(`/api/instructors/professors?${params}`);
}

export async function fetchProfessorsByFaculty(facultyId) {
    const params = new URLSearchParams({ facultyId });
    return apiClient(`/api/instructors/professors?${params}`);
}

export async function fetchFaculties() {
    return apiClient('/api/faculties');
}

export async function fetchInstructorCourses(instructorId) {
    const result = await apiClient(`/api/Courses/instructor/${instructorId}?PageSize=50`);
    return result?.data ?? result ?? [];
}

export async function fetchInstructorTASections(instructorId) {
  return apiClient(`/api/Classes/ta-sections?instructorId=${instructorId}`);
}

export async function fetchInstructorProfessorLectures(instructorId) {
  const all = await apiClient('/api/Classes/professor-lectures');
  return (Array.isArray(all) ? all : []).filter(s => s.instructorId == instructorId);
}

export async function fetchInstructorAvailableSections(instructorId, courseId) {
  const all = await apiClient(`/api/Classes/course/${courseId}?classType=Section`);
  return Array.isArray(all) ? all : [];
}

export async function changeInstructorSection(instructorId, courseId, section) {
    await apiClient(`/api/instructors/${instructorId}/courses/${courseId}/section`, {
        method: "PATCH",
        body: JSON.stringify({ section }),
    });
    return true;
}
