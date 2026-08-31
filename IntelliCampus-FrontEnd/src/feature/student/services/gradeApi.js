import apiClient, { downloadBlob } from "../../../api/apiClient";

export const fetchCourseGrade = async (courseId) => {
  try {
    const res = await apiClient(`/api/grades/course/${courseId}`);
    if (!res) return null;
    const courseGrade = Array.isArray(res.data) ? res.data[0] : res;
    return courseGrade ?? null;
  } catch (err) {
    if (err.status === 404) return null;
    throw new Error(err.detail || `Failed to fetch course grade (${err.status})`);
  }
};

export const fetchAllMyGrades = async () => {
  return apiClient('/api/grades/my-grades');
};

export const fileGradeComplaint = async (complaintData) => {
  return apiClient('/api/grades/complaint', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  });
};

export const fetchMyComplaints = async () => {
  return apiClient('/api/grades/complaints');
};

export const fetchTranscript = async () => {
  return apiClient('/api/grades/transcript');
};

export const fetchAcademicProgress = async () => {
  return apiClient('/api/grades/academic-progress');
};

export const exportTranscriptPdf = async () => {
  await downloadBlob('/api/grades/transcript/export', 'Transcript.pdf');
};
