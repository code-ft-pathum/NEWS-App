import { NextResponse } from 'next/server';
import { testFirebaseInit } from '@/lib/test-firebase';

export const dynamic = 'force-dynamic';

export async function GET() {
    const result = await testFirebaseInit();
    
    return NextResponse.json(result, {
        status: result.success ? 200 : 500
    });
}
