import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get("auth");

    return NextResponse.json({
        auth_cookie_exists: !!authCookie,
        auth_cookie_value: authCookie?.value || "NOT SET",
        all_cookies: Array.from(cookieStore.getSetCookie ? cookieStore.getSetCookie() : []),
    });
}
