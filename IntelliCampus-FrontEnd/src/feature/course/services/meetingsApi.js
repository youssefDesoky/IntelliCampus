import apiClient from "../../../api/apiClient";

export async function fetchCourseMeetings(courseId) {
  return apiClient(`/api/meetings/course/${courseId}`);
}

export async function createMeeting({ title, dateTime, courseId }) {
  return apiClient('/api/meetings', {
    method: 'POST',
    body: JSON.stringify({ Title: title, DateTime: dateTime, CourseId: courseId }),
  });
}

export async function fetchMeetingById(meetingId) {
  return apiClient(`/api/meetings/${meetingId}`);
}

export async function deleteMeeting(meetingId) {
  await apiClient(`/api/meetings/${meetingId}`, { method: 'DELETE' });
  return true;
}

export async function endMeeting(meetingId) {
  await apiClient(`/api/meetings/${meetingId}/end`, { method: 'POST' });
  return true;
}
