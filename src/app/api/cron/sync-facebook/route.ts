import { NextRequest, NextResponse } from "next/server";
import { triggerCronSync } from "@/app/actions/automate";

export const dynamic = "force-dynamic";

async function handleCronRequest(request: NextRequest) {
    const configuredSecret = process.env.CRON_SECRET;

    if (!configuredSecret) {
        return NextResponse.json(
            { success: false, message: "CRON_SECRET is not configured." },
            { status: 500 }
        );
    }

    const expectedAuthorization = `Bearer ${configuredSecret}`;
    const incomingAuthorization = request.headers.get("authorization");

    if (incomingAuthorization !== expectedAuthorization) {
        return NextResponse.json(
            { success: false, message: "Unauthorized" },
            { status: 401 }
        );
    }

    const result = await triggerCronSync();
    const status = result.success ? 200 : result.message === "Automation is disabled" || result.message === "Sync on cooldown" ? 200 : 500;

    return NextResponse.json(result, { status });
}

export async function GET(request: NextRequest) {
    return handleCronRequest(request);
}

export async function POST(request: NextRequest) {
    return handleCronRequest(request);
}