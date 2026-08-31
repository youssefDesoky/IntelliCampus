import apiClient from "../../../api/apiClient";

export async function fetchRemindersByDay(selectedDay) {
  const dateStr = selectedDay instanceof Date
    ? selectedDay.toISOString().split('T')[0]
    : selectedDay;

  const url = `/api/instructorreminders?selectedDay=${dateStr}`;

  const data = await apiClient(url);

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const allReminders = [
      ...(Array.isArray(data.selectedDay) ? data.selectedDay : []),
      ...(Array.isArray(data.nextDay) ? data.nextDay : []),
      ...(Array.isArray(data.week) ? data.week : []),
    ];

    const seen = {};
    const deduplicated = allReminders.filter((reminder) => {
      if (seen[reminder.id]) {
        return false;
      }
      seen[reminder.id] = true;
      return true;
    });

    return deduplicated;
  }

  return Array.isArray(data) ? data : [];
}

export async function createReminder(reminderData) {
  return apiClient('/api/instructorreminders', {
    method: 'POST',
    body: JSON.stringify(reminderData),
  });
}

export async function updateReminder(reminderId, reminderData) {
  return apiClient(`/api/instructorreminders/${reminderId}`, {
    method: 'PUT',
    body: JSON.stringify(reminderData),
  });
}

export async function deleteReminder(reminderId) {
  await apiClient(`/api/instructorreminders/${reminderId}`, { method: 'DELETE' });
  return true;
}
