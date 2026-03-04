import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const username = (formData.get("username") as string)?.trim() ?? "";
    const password = (formData.get("password") as string) ?? "";

    const validUsername = process.env.DASHBOARD_USERNAME || "NEWSAPP";
    const validPassword = process.env.DASHBOARD_PASSWORD || "Today@news";

    if (username !== validUsername || password !== validPassword) {
        // Redirect back to login with an error param
        return NextResponse.redirect(new URL("/dashboard/login?error=invalid", request.url));
    }

    // Credentials valid — set cookie and redirect to dashboard
    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("auth", "admin-secret", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });

    return response;
}
