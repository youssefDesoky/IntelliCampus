import apiClient, { downloadBlob } from "../../../api/apiClient";

export async function fetchMyExams() {
  return apiClient('/api/examschedule/my-exams');
}

export async function fetchMidterms() {
  return apiClient('/api/examschedule/my-exams/midterms');
}

export async function fetchFinals() {
  return apiClient('/api/examschedule/my-exams/finals');
}

export async function fetchUpcomingExams() {
  return apiClient('/api/examschedule/my-exams/upcoming');
}

export async function fetchExamScheduleById(examScheduleId) {
  return apiClient(`/api/examschedule/${examScheduleId}`);
}

export async function exportExamSchedulePdf(type, status) {
  let url = '/api/examschedule/my-exams/export';
  const params = [];
  if (type) params.push(`type=${encodeURIComponent(type)}`);
  if (status) params.push(`status=${encodeURIComponent(status)}`);
  if (params.length) url += `?${params.join("&")}`;

  await downloadBlob(url, 'ExamSchedule.pdf');
}
