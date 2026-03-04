"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function handleLogin(username: string, password: string) {
    const validUsername = (process.env.DASHBOARD_USERNAME || "NEWSAPP").trim();
    const validPassword = (process.env.DASHBOARD_PASSWORD || "Today@news").trim();

    if (username.trim() !== validUsername || password.trim() !== validPassword) {
        return { success: false, error: "Invalid credentials. Access Denied." };
    }

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set("auth", "admin-secret", {
        httpOnly: false, // Make it easily readable by window.location
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });

    return { success: true };
}

export async function handleLogout() {
    const cookieStore = await cookies();
    cookieStore.delete("auth");
    redirect("/dashboard/login");
}
