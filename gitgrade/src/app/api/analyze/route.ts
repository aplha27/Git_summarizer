import { NextResponse } from "next/server";
import { fetchRepoData } from "@/lib/github";
import { analyzeRepo } from "@/lib/ai";

export async function POST(request: Request) {
    try {
        const { repoUrl, roastMode } = await request.json();

        if (!repoUrl) {
            return NextResponse.json({ error: "Repository URL is required" }, { status: 400 });
        }

        // 1. Fetch Data
        console.log(`Fetching data for: ${repoUrl}`);
        const repoContext = await fetchRepoData(repoUrl);

        // 2. Analyze with AI
        console.log("Starting AI analysis...");
        const analysis = await analyzeRepo(repoContext, roastMode);

        // 3. Update Stats
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/stats`, {
                method: 'POST'
            });
        } catch (e) {
            // Stats update failed, but don't break the analysis
        }

        // 4. Return Combined Result
        return NextResponse.json({
            ...analysis,
            usingFallback: analysis.summary.includes("AI APIs are down") || analysis.summary.includes("API quota exceeded")
        });

    } catch (error: any) {
        console.error("Analysis Error:", error);
        return NextResponse.json(
            { error: error.message || "Something went wrong during analysis." },
            { status: 500 }
        );
    }
}
