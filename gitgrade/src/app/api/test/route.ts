import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ 
        status: "OK", 
        message: "GitGrade API is working!",
        timestamp: new Date().toISOString()
    });
}