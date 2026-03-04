"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleLogin(username: string, password: string) {
    const validUsername = process.env.DASHBOARD_USERNAME || "NEWSAPP";
    const validPassword = process.env.DASHBOARD_PASSWORD || "Today@news";

    if (username.trim() !== validUsername.trim() || password !== validPassword) {
        return { success: false, error: "Invalid credentials. Access Denied." };
    }

    // Set cookie first, then redirect — both happen in the same server response
    const cookieStore = await cookies();
    cookieStore.set("auth", "admin-secret", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });

    // Server-side redirect — cookie is already in the response headers
    redirect("/dashboard");
}

export async function handleLogout() {
    const cookieStore = await cookies();
    cookieStore.delete("auth");
    redirect("/dashboard/login");
}
