import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";
import { RepoContext } from "./github";

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

// Initialize AI clients
const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const groq = process.env.GROQ_API_KEY ? new Groq({ apiKey: process.env.GROQ_API_KEY }) : null;

export async function analyzeRepo(context: RepoContext, roastMode: boolean = false): Promise<AnalysisResult> {
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

    // Try Groq first (most reliable free option)
    if (groq) {
        const groqModels = ["llama-3.1-8b-instant", "llama3-8b-8192", "mixtral-8x7b-32768"];
        
        for (const model of groqModels) {
            try {
                console.log(`Analyzing with Groq (${model})...`);
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: model,
                    response_format: { type: "json_object" },
                    temperature: 0.7,
                });

                const responseText = completion.choices[0]?.message?.content;
                if (responseText) {
                    const data = JSON.parse(responseText) as AnalysisResult;
                    console.log(`✅ Groq analysis successful with ${model}`);
                    return data;
                }
            } catch (error: any) {
                console.error(`Groq ${model} failed:`, error.message);
                // Continue to next model
            }
        }
    }

    // Fallback to Gemini
    if (gemini) {
        const geminiModels = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest", "gemini-1.0-pro"];
        
        for (const modelName of geminiModels) {
            try {
                console.log(`Analyzing with Gemini (${modelName})...`);
                const model = gemini.getGenerativeModel({ model: modelName });
                const result = await model.generateContent({
                    contents: [{ role: "user", parts: [{ text: prompt }] }],
                    generationConfig: {
                        responseMimeType: "application/json",
                    }
                });

                const responseText = result.response.text();
                const data = JSON.parse(responseText) as AnalysisResult;
                console.log(`✅ Gemini analysis successful with ${modelName}`);
                return data;
            } catch (error: any) {
                console.error(`Gemini ${modelName} failed:`, error.message);
                // Continue to next model
            }
        }
    }

    // Final fallback - local analysis
    console.log("Using fallback analysis - no AI APIs available");
    return generateFallbackAnalysis(context, roastMode);
}

// Enhanced fallback analysis when APIs are unavailable
function generateFallbackAnalysis(context: RepoContext, roastMode: boolean): AnalysisResult {
    let score = 40; // Base score
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const roadmap: Array<{title: string, description: string, priority: "High" | "Medium" | "Low"}> = [];

    // Documentation Analysis (20 points)
    if (context.readme) {
        const readmeLength = context.readme.length;
        if (readmeLength > 1000) {
            score += 20;
            strengths.push("Comprehensive README documentation");
        } else if (readmeLength > 200) {
            score += 15;
            strengths.push("Has README documentation");
        } else {
            score += 5;
            weaknesses.push("README exists but lacks detail");
        }
    } else {
        weaknesses.push("Missing README file");
        roadmap.push({
            title: "Create README",
            description: "Add comprehensive documentation with setup instructions, usage examples, and project overview",
            priority: "High"
        });
    }

    // Testing Analysis (20 points)
    if (context.hasTests) {
        score += 20;
        strengths.push("Includes test coverage");
    } else {
        weaknesses.push("No test coverage found");
        roadmap.push({
            title: "Add Test Suite",
            description: "Implement unit tests, integration tests, and set up testing framework",
            priority: "High"
        });
    }

    // CI/CD Analysis (10 points)
    if (context.hasCI) {
        score += 10;
        strengths.push("Has CI/CD automation");
    } else {
        weaknesses.push("No automated workflows");
        roadmap.push({
            title: "Setup CI/CD Pipeline",
            description: "Add GitHub Actions for automated testing, linting, and deployment",
            priority: "Medium"
        });
    }

    // Dependencies Analysis (10 points)
    const depCount = Object.keys(context.dependencies).length;
    if (depCount > 0) {
        if (depCount < 20) {
            score += 10;
            strengths.push("Reasonable dependency count");
        } else if (depCount < 50) {
            score += 5;
            strengths.push("Uses modern dependencies");
        } else {
            score += 2;
            weaknesses.push("Heavy dependency usage");
        }
    } else {
        weaknesses.push("No package management detected");
    }

    // Project Structure Analysis (10 points)
    const fileCount = context.fileTree.length;
    if (fileCount > 5 && fileCount < 100) {
        score += 10;
        strengths.push("Well-organized project structure");
    } else if (fileCount >= 100) {
        score += 5;
        strengths.push("Large, complex project");
    } else {
        score += 2;
        weaknesses.push("Limited project scope");
    }

    // Docker Analysis (5 points)
    if (context.hasDockerfile) {
        score += 5;
        strengths.push("Containerization ready");
    } else {
        roadmap.push({
            title: "Add Docker Support",
            description: "Create Dockerfile for consistent deployment environments",
            priority: "Low"
        });
    }

    // Commit Analysis (5 points)
    if (context.commits.length > 0) {
        const recentCommits = context.commits.slice(0, 5);
        const goodCommits = recentCommits.filter(c => 
            c.message && c.message.length > 10 && !c.message.toLowerCase().includes('fix')
        );
        
        if (goodCommits.length >= 3) {
            score += 5;
            strengths.push("Good commit practices");
        } else {
            score += 2;
            weaknesses.push("Commit messages need improvement");
        }
    }

    // Language Diversity (5 points)
    const languageCount = Object.keys(context.languages).length;
    if (languageCount > 1) {
        score += 5;
        strengths.push("Multi-language project");
    }

    // Add generic roadmap items
    if (score < 70) {
        roadmap.push({
            title: "Code Quality Review",
            description: "Review code for best practices, error handling, and optimization opportunities",
            priority: "Medium"
        });
    }

    if (!context.readme?.includes("installation") && !context.readme?.includes("setup")) {
        roadmap.push({
            title: "Improve Documentation",
            description: "Add installation instructions, usage examples, and API documentation",
            priority: "Medium"
        });
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    const level = score >= 85 ? "Elite" : score >= 70 ? "Pro" : score >= 50 ? "Intermediate" : "Beginner";

    const summary = roastMode 
        ? `Score: ${score}/100. AI's taking a coffee break, but I can still judge your code. ${score > 70 ? "Not bad for a human." : score > 50 ? "Mediocre at best." : "Yikes, this needs work."} ${context.hasTests ? "At least you test your code." : "No tests? Bold strategy."}`
        : `Intelligent analysis complete. Score: ${score}/100. ${context.readme ? "Good documentation foundation" : "Documentation needs attention"}. ${context.hasTests ? "Testing practices established" : "Testing implementation recommended"}. ${score > 70 ? "Strong project foundation" : "Room for improvement identified"}.`;

    return {
        score,
        level: level as "Beginner" | "Intermediate" | "Pro" | "Elite",
        summary,
        strengths,
        weaknesses,
        roadmap
    };
}