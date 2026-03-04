import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const username = (formData.get("username") as string)?.trim() ?? "";
    const password = (formData.get("password") as string)?.trim() ?? "";

    const validUsername = (process.env.DASHBOARD_USERNAME || "NEWSAPP").trim();
    const validPassword = (process.env.DASHBOARD_PASSWORD || "Today@news").trim();

    if (username !== validUsername || password !== validPassword) {
        // Redirect back to login with an error param using 303 to force GET request
        return NextResponse.redirect(new URL("/dashboard/login?error=invalid", request.url), 303);
    }

    // Credentials valid — set cookie and redirect to dashboard using 303
    const response = NextResponse.redirect(new URL("/dashboard", request.url), 303);
    response.cookies.set("auth", "admin-secret", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/",
    });

    return response;
}
