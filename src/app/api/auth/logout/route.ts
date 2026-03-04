import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const response = NextResponse.redirect(new URL("/dashboard/login", request.url));
    response.cookies.delete("auth");
    return response;
}
