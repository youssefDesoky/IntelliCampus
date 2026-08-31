import { redirect } from "react-router-dom";
import { API_URL } from "../../config/api";

export default async function rootAuthLoader() {
    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            credentials: "include",
        });

        if (res.status === 401) {
            throw redirect("/login");
        }

        const data = await res.json();

        if (data.mustChangePassword) {
            throw redirect("/first-time-setup");
        }

        return data;
    } catch (err) {
        if (err instanceof Response) throw err;
        throw redirect("/login");
    }
}
