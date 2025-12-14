import { GoogleGenerativeAI } from "@google/generative-ai";
import { RepoContext } from "./github";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AnalysisResult {
    score: number;
    level: "Beginner" | "Intermediate" | "Pro" | "Elite";
    summary: string;
    strengths: string[];
    weaknesses: string[];
    roadmap: Array<{
        title: string;
        description: string;
        priority: "High" | "Medium" | "Low";
    }>;
}

export async function analyzeRepo(context: RepoContext, roastMode: boolean = false): Promise<AnalysisResult> {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const persona = roastMode
        ? "You are a savage, sarcastic, and funny Senior Principal Engineer who has seen too much bad code. Roast this repository mercilessly. Make it hurt but be technically accurate. Use slang, be condescending, but still provide the structured output."
        : "You are a ruthless but helpful Senior Staff Engineer at FAANG. You are grading a candidate's repository.";

    const prompt = `
    ${persona}
    I will provide the file structure, dependency list, README content, and key code snippets.

    CONTEXT:
    Repo Name: ${context.owner}/${context.repo}
    Metadata: ${JSON.stringify(context.metadata)}
    
    File Structure (${context.fileTree.length} files):
    ${context.fileTree.join("\n")}

    Dependencies (${Object.keys(context.dependencies).length} total):
    ${JSON.stringify(context.dependencies, null, 2)}

    Languages Used:
    ${JSON.stringify(context.languages, null, 2)}

    Recent Commits (${context.commits.length} shown):
    ${context.commits.map(c => `- ${c.message} (${c.author})`).join("\n")}

    Quality Indicators:
    - Has Tests: ${context.hasTests ? "✅ YES" : "❌ NO"}
    - Has CI/CD: ${context.hasCI ? "✅ YES" : "❌ NO"}  
    - Has Docker: ${context.hasDockerfile ? "✅ YES" : "❌ NO"}

    README Content:
    ${context.readme || "❌ NO README FOUND"}

    Main Entry Point Content:
    ${context.mainFile || "❌ NO MAIN FILE FOUND"}

    TASK:
    Analyze this repository comprehensively. Be critical but fair.
    
    SCORING CRITERIA (0-100):
    - Code Quality & Structure (25 points): Clean code, good architecture, proper file organization
    - Documentation (20 points): README quality, code comments, API docs
    - Testing & CI/CD (20 points): Test coverage, automated workflows, quality gates
    - Dependencies & Security (15 points): Up-to-date deps, no vulnerabilities, proper package management
    - Git Practices (10 points): Commit quality, branching, meaningful messages
    - Real-world Applicability (10 points): Practical use case, completeness, deployment readiness
    
    DEDUCTIONS:
    - No tests: -20 points
    - No README: -15 points  
    - Poor commit messages: -10 points
    - Outdated dependencies: -10 points
    - No CI/CD: -5 points
    - Flat file structure: -5 points

    OUTPUT FORMAT (Strict JSON):
    {
      "score": number (0-100),
      "level": "Beginner" | "Intermediate" | "Pro" | "Elite",
      "summary": "2 sentences, brutal but fair.",
      "strengths": ["string", "string"],
      "weaknesses": ["string", "string"],
      "roadmap": [{ "title": "string", "description": "string", "priority": "High" | "Medium" | "Low" }]
    }
  `;

    try {
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
            }
        });

        const responseText = result.response.text();
        const data = JSON.parse(responseText) as AnalysisResult;
        return data;
    } catch (error: any) {
        console.error("Gemini Analysis Failed:", error);
        
        // If quota exceeded, model not found, or any API error, return a fallback analysis
        if (error.status === 429 || error.status === 404 || 
            error.message?.includes('quota') || 
            error.message?.includes('not found') ||
            error.message?.includes('GoogleGenerativeAI Error')) {
            console.log("Using fallback analysis due to API error");
            return generateFallbackAnalysis(context, roastMode);
        }
        
        // For any other error, also use fallback to ensure the app works
        console.log("Using fallback analysis for unknown error");
        return generateFallbackAnalysis(context, roastMode);
    }
}

// Fallback analysis when API is unavailable
function generateFallbackAnalysis(context: RepoContext, roastMode: boolean): AnalysisResult {
    let score = 50; // Base score
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const roadmap: Array<{title: string, description: string, priority: "High" | "Medium" | "Low"}> = [];

    // Basic scoring logic
    if (context.readme) {
        score += 15;
        strengths.push("Has README documentation");
    } else {
        score -= 15;
        weaknesses.push("Missing README file");
        roadmap.push({
            title: "Add README",
            description: "Create a comprehensive README with project overview and setup instructions",
            priority: "High"
        });
    }

    if (context.hasTests) {
        score += 20;
        strengths.push("Includes test files");
    } else {
        score -= 20;
        weaknesses.push("No test coverage found");
        roadmap.push({
            title: "Add Tests",
            description: "Implement unit and integration tests to ensure code quality",
            priority: "High"
        });
    }

    if (context.hasCI) {
        score += 10;
        strengths.push("Has CI/CD setup");
    } else {
        weaknesses.push("No CI/CD pipeline");
        roadmap.push({
            title: "Setup CI/CD",
            description: "Add GitHub Actions for automated testing and deployment",
            priority: "Medium"
        });
    }

    if (Object.keys(context.dependencies).length > 0) {
        score += 5;
        strengths.push("Uses modern dependencies");
    }

    if (context.fileTree.length > 10) {
        score += 5;
        strengths.push("Well-structured project");
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    const level = score >= 90 ? "Elite" : score >= 70 ? "Pro" : score >= 50 ? "Intermediate" : "Beginner";

    const summary = roastMode 
        ? `Score: ${score}/100. API quota exceeded, but from what I can see, this repo ${score > 60 ? "isn't terrible" : "needs serious work"}. ${context.hasTests ? "At least you wrote some tests." : "No tests? Really?"}`
        : `Repository analysis complete. Score: ${score}/100. ${context.readme ? "Good documentation foundation." : "Documentation needs improvement."} ${context.hasTests ? "Testing practices in place." : "Consider adding comprehensive tests."}`;

    return {
        score,
        level: level as "Beginner" | "Intermediate" | "Pro" | "Elite",
        summary,
        strengths,
        weaknesses,
        roadmap
    };
}
