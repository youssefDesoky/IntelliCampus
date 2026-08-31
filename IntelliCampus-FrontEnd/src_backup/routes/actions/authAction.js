import { json, redirect } from "react-router-dom";
import { login } from "../../api/authService";
import { ApiError } from "../../api/apiClient";
import { queryClient } from "../../main";

export default async function authAction({ request }) {
    const formData = await request.formData();
    const email = (formData.get("email") || "").trim();
    const password = formData.get("password");

    try {
        const data = await login(email, password);
        // Clear any data cached for a previous user so we never leak another
        // user's dashboard/courses/grades across sessions on the same browser.
        queryClient.clear();
        const roles = (data.roles || []).map(r => r.toLowerCase());

        if (roles.some(r => r.startsWith('student'))) {
            return redirect('/');
        } else if (roles.some(r => r === 'instructor')) {
            return redirect('/instructor');
        } else if (roles.some(r => r.startsWith('admin') || r === 'superadmin')) {
            return redirect('/admin');
        }
        return json({ message: "Unknown role" }, { status: 403 });
    } catch (err) {
        if (err instanceof ApiError && err.status === 403 && err.body?.type === "must_change_password") {
            return redirect("/first-time-setup");
        }
        if (err instanceof ApiError && err.status === 401) {
            return json({ message: "Invalid email or password" }, { status: 401 });
        }
        const detail = (err instanceof ApiError ? err.detail : null) || err?.message || "Something went wrong. Please try again.";
        return json({ message: detail }, { status: (err instanceof ApiError ? err.status : 500) });
    }
}