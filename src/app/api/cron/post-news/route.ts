import { NextRequest, NextResponse } from "next/server";
import { triggerAutomation } from "@/app/actions/automate";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const authHeader = request.headers.get('authorization');

    // Check for Vercel Cron Secret (Optional but recommended)
    // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    //     return new Response('Unauthorized', { status: 401 });
    // }

    try {
        const result = await triggerAutomation();
        return NextResponse.json(result);
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
