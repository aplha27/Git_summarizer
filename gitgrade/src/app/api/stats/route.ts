import { NextResponse } from "next/server";

// In a real app, this would come from a database
let stats = {
    totalAnalyses: 1247,
    averageScore: 67.3,
    topLanguages: ["JavaScript", "Python", "TypeScript", "Java", "Go"],
    lastUpdated: new Date().toISOString()
};

export async function GET() {
    // Simulate some growth
    stats.totalAnalyses += Math.floor(Math.random() * 3);
    stats.averageScore += (Math.random() - 0.5) * 0.1;
    
    return NextResponse.json(stats);
}

export async function POST() {
    // Increment stats when analysis is performed
    stats.totalAnalyses += 1;
    stats.lastUpdated = new Date().toISOString();
    
    return NextResponse.json({ success: true });
}