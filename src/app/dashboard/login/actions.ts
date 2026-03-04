"use server";

import { cookies } from "next/headers";

export async function handleLogin(username: string, password: string) {
    const validUsername = process.env.DASHBOARD_USERNAME || "NEWSAPP";
    const validPassword = process.env.DASHBOARD_PASSWORD || "Today@news";

    if (username.trim() !== validUsername.trim() || password !== validPassword) {
        return { success: false, error: "Invalid credentials. Access Denied." };
    }

    try {
        const cookieStore = await cookies();
        cookieStore.set("auth", "admin-secret", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: "/",
        });
        return { success: true };
    } catch (error: any) {
        console.error("[Auth] Cookie set failed:", error.message);
        return { success: false, error: "Failed to authenticate. Please try again." };
    }
}

export async function handleLogout() {
    const cookieStore = await cookies();
    cookieStore.delete("auth");
}
