import { redirect } from "react-router-dom";
import { logout, unregisterDevice } from "../../api/authService";
import { queryClient } from "../../main";

export default async function logoutAction() {
    // Wipe the react-query cache so the next user logging in doesn't see the
    // previous user's cached data (query keys are not scoped by user id).
    queryClient.clear();

    try {
        const endpoint = localStorage.getItem('push_endpoint');
        if (endpoint) {
            await unregisterDevice(endpoint).catch(() => {});
        }
    } catch { /* ignore */ }
    localStorage.removeItem('push_endpoint');

    try {
        await logout();
    } catch {
        // ignore network errors on logout
    }

    return redirect("/login");
}
