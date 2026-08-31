import apiClient, { downloadBlob } from "../../../api/apiClient";

export async function fetchMySchedule(types = []) {
  let url = '/api/instructor/schedule/my-schedule';

  if (types && types.length > 0) {
    const typeParams = types.map((t) => `types=${encodeURIComponent(t)}`).join("&");
    url += `?${typeParams}`;
  }

  return apiClient(url);
}

export async function fetchScheduleById(scheduleId) {
  return apiClient(`/api/instructor/schedule/${scheduleId}`);
}

export async function exportSchedulePdf(types = []) {
  let url = '/api/instructor/schedule/my-schedule/export';

  if (types && types.length > 0) {
    const typeParams = types.map((t) => `types=${encodeURIComponent(t)}`).join("&");
    url += `?${typeParams}`;
  }

  await downloadBlob(url, 'WeeklySchedule.pdf');
}
