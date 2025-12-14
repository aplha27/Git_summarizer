"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Github, Loader2, Sparkles, AlertCircle, Flame } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import { REACT_DEMO_DATA } from "@/lib/demoData";
import clsx from "clsx";

export default function Home() {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [roastMode, setRoastMode] = useState(false);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        // Fetch live stats
        fetch('/api/stats')
            .then(res => res.json())
            .then(setStats)
            .catch(console.error);
    }, []);

    const analyze = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!url) return;

        setLoading(true);
        setError(null);
        setData(null);

        try {
            // Validate GitHub URL
            if (!url.includes('github.com')) {
                throw new Error("Please provide a valid GitHub repository URL");
            }

            const response = await fetch("/api/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ repoUrl: url, roastMode }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Failed to analyze repository");
            }

            setData(result);
        } catch (err: any) {
            console.error("Analysis error:", err);
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const loadDemo = () => {
        setUrl("https://github.com/facebook/react");
        setLoading(true);
        // Simulate network delay for effect
        setTimeout(() => {
            // Create a roast version of the data if roast mode is on
            const demoData = roastMode ? {
                ...REACT_DEMO_DATA,
                summary: "Oh wow, it's React. We get it, you're popular. But your commit history looks like a crime scene and your build system requires a PhD to understand. Typical Meta over-engineering.",
                level: "Elite (But Annoying)",
                strengths: ["It actually works (surprisingly)", "Documentation is decent if you like reading novels"],
                weaknesses: ["Bloated history", "Flow types? In 2024? Gross.", "Suspense is still confusing everyone"],
                usingFallback: false
            } : {
                ...REACT_DEMO_DATA,
                usingFallback: false
            };

            setData(demoData);
            setLoading(false);
            setError(null);
        }, 1500);
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-cyan-500/30">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>

            <AnimatePresence mode="wait">
                {!data && (
                    <motion.div
                        key="input"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, y: -50 }}
                        className="flex flex-col items-center justify-center min-h-[calc(100vh-5rem)] px-4 relative z-10"
                    >
                        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-cyan-500/50 to-transparent"></div>

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-center mb-12"
                        >
                            <div className="inline-block p-3 rounded-2xl bg-gray-900/50 border border-gray-800 mb-6 backdrop-blur-xl shadow-2xl shadow-cyan-900/20">
                                <Github size={48} className="text-white" />
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 bg-clip-text text-transparent bg-linear-to-br from-white via-gray-200 to-gray-600">
                                GIT GRADE
                            </h1>
                            <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-4">
                                AI-Powered Repository Profiler. <span className={roastMode ? "text-red-500 font-bold" : "text-cyan-400"}>{roastMode ? "SAVAGE." : "Ruthless."}</span> Insightful. Instant.
                            </p>
                            {stats && (
                                <div className="flex justify-center gap-6 text-sm text-gray-500">
                                    <span>{stats.totalAnalyses.toLocaleString()} repositories analyzed</span>
                                    <span>•</span>
                                    <span>{stats.averageScore.toFixed(1)} average score</span>
                                </div>
                            )}
                        </motion.div>

                        <motion.form
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            onSubmit={analyze}
                            className="w-full max-w-xl relative group"
                        >
                            <div className={clsx("absolute -inset-1 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000", roastMode ? "bg-linear-to-r from-red-500 to-orange-600" : "bg-linear-to-r from-cyan-500 to-purple-600")}></div>
                            <div className="relative flex items-center bg-gray-900 rounded-xl border border-gray-800 p-2 shadow-2xl">
                                <Search className="text-gray-500 ml-3" size={20} />
                                <input
                                    type="text"
                                    placeholder="https://github.com/username/repo"
                                    className="w-full bg-transparent border-none focus:ring-0 text-white placeholder-gray-600 px-4 py-3 outline-none"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                    suppressHydrationWarning={true}
                                />
                                <button
                                    disabled={loading}
                                    type="submit"
                                    className={clsx("px-6 py-3 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2", roastMode ? "bg-red-600 text-white hover:bg-red-700" : "bg-white text-black hover:bg-gray-200")}
                                    suppressHydrationWarning={true}
                                >
                                    {loading ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                    {loading ? "Scanning..." : "Analyze"}
                                </button>
                            </div>
                        </motion.form>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="mt-8 flex items-center gap-3"
                        >
                            <span className={clsx("text-sm font-bold", roastMode ? "text-gray-500" : "text-white")}>Standard</span>
                            <button
                                onClick={() => setRoastMode(!roastMode)}
                                className={clsx("w-14 h-8 rounded-full p-1 transition-colors duration-300 relative", roastMode ? "bg-red-600" : "bg-gray-700")}
                                suppressHydrationWarning={true}
                            >
                                <motion.div
                                    layout
                                    className={clsx("w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center", roastMode ? "ml-auto" : "mr-auto")}
                                >
                                    {roastMode && <Flame size={14} className="text-red-500" />}
                                </motion.div>
                            </button>
                            <span className={clsx("text-sm font-bold flex items-center gap-1", roastMode ? "text-red-500" : "text-gray-500")}>
                                <Flame size={14} /> Roast Mode
                            </span>
                        </motion.div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50 flex items-center gap-2"
                            >
                                <AlertCircle size={16} />
                                {error}
                            </motion.div>
                        )}

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="mt-8 flex gap-4 text-sm"
                        >
                            <button
                                onClick={loadDemo}
                                className="text-gray-600 hover:text-white transition underline decoration-gray-800 underline-offset-4"
                                suppressHydrationWarning={true}
                            >
                                Try demo repo
                            </button>
                            <span className="text-gray-800">•</span>
                            <button
                                onClick={() => {
                                    setUrl("https://github.com/your-username/sample-repo");
                                    setData({
                                        score: 73,
                                        level: "Pro",
                                        summary: "Solid project structure with room for improvement. Good use of modern practices but missing some key elements.",
                                        strengths: ["Clean code structure", "Good README documentation", "Modern tech stack"],
                                        weaknesses: ["No test coverage", "Missing CI/CD", "Could use better error handling"],
                                        roadmap: [
                                            { title: "Add Unit Tests", description: "Implement comprehensive test suite", priority: "High" },
                                            { title: "Setup CI/CD", description: "Add GitHub Actions for automated testing", priority: "Medium" },
                                            { title: "Improve Error Handling", description: "Add try-catch blocks and user feedback", priority: "Low" }
                                        ],
                                        usingFallback: true
                                    });
                                }}
                                className="text-gray-600 hover:text-white transition underline decoration-gray-800 underline-offset-4"
                                suppressHydrationWarning={true}
                            >
                                Offline demo
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {data && <Dashboard data={data} repoUrl={url} />}
            </AnimatePresence>
        </main>
    );
}
