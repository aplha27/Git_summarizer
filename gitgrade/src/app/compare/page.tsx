"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, GitCompare, Trophy, TrendingUp, TrendingDown, Minus, Crown, Medal, Award } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface ComparisonData {
    repoUrl: string;
    score: number;
    level: string;
    summary: string;
    strengths: string[];
    weaknesses: string[];
    roadmap: Array<{
        title: string;
        description: string;
        priority: string;
    }>;
    usingFallback?: boolean;
}

export default function ComparePage() {
    const [repos, setRepos] = useState<string[]>(["", ""]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [comparisonData, setComparisonData] = useState<ComparisonData[] | null>(null);
    const [analysis, setAnalysis] = useState<any>(null);

    const addRepo = () => {
        if (repos.length < 4) {
            setRepos([...repos, ""]);
        }
    };

    const removeRepo = (index: number) => {
        if (repos.length > 2) {
            setRepos(repos.filter((_, i) => i !== index));
        }
    };

    const updateRepo = (index: number, value: string) => {
        const newRepos = [...repos];
        newRepos[index] = value;
        setRepos(newRepos);
    };

    const handleCompare = async () => {
        const validRepos = repos.filter(repo => repo.trim() !== "");
        if (validRepos.length < 2) {
            setError("Please provide at least 2 repository URLs");
            return;
        }

        setLoading(true);
        setError(null);
        setComparisonData(null);
        setAnalysis(null);

        try {
            const results = await Promise.all(
                validRepos.map(async (repoUrl) => {
                    const response = await fetch("/api/analyze", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ repoUrl, roastMode: false }),
                    });
                    const result = await response.json();
                    return { ...result, repoUrl };
                })
            );

            setComparisonData(results);
            setAnalysis(generateComparisonAnalysis(results));
        } catch (err: any) {
            setError(err.message || "Failed to compare repositories");
        } finally {
            setLoading(false);
        }
    };

    const generateComparisonAnalysis = (data: ComparisonData[]) => {
        const sorted = [...data].sort((a, b) => b.score - a.score);
        const winner = sorted[0];
        const categories = analyzeCategories(data);
        
        return {
            winner,
            rankings: sorted,
            categories,
            insights: generateInsights(data),
            recommendations: generateRecommendations(data)
        };
    };

    const analyzeCategories = (data: ComparisonData[]) => {
        return [
            {
                name: "Overall Score",
                winner: data.reduce((prev, current) => prev.score > current.score ? prev : current),
                scores: data.map(repo => ({ repo: getRepoName(repo.repoUrl), score: repo.score }))
            },
            {
                name: "Documentation",
                winner: data.reduce((prev, current) => 
                    (prev.strengths.filter(s => s.toLowerCase().includes('readme') || s.toLowerCase().includes('documentation')).length >
                     current.strengths.filter(s => s.toLowerCase().includes('readme') || s.toLowerCase().includes('documentation')).length) ? prev : current
                ),
                scores: data.map(repo => ({
                    repo: getRepoName(repo.repoUrl),
                    score: repo.strengths.filter(s => s.toLowerCase().includes('readme') || s.toLowerCase().includes('documentation')).length * 25
                }))
            },
            {
                name: "Testing",
                winner: data.reduce((prev, current) => 
                    (prev.strengths.filter(s => s.toLowerCase().includes('test')).length >
                     current.strengths.filter(s => s.toLowerCase().includes('test')).length) ? prev : current
                ),
                scores: data.map(repo => ({
                    repo: getRepoName(repo.repoUrl),
                    score: repo.strengths.filter(s => s.toLowerCase().includes('test')).length * 30
                }))
            }
        ];
    };

    const generateInsights = (data: ComparisonData[]) => {
        const insights = [];
        const avgScore = data.reduce((sum, repo) => sum + repo.score, 0) / data.length;
        
        insights.push(`Average score across all repositories: ${avgScore.toFixed(1)}/100`);
        
        const highestScore = Math.max(...data.map(r => r.score));
        const lowestScore = Math.min(...data.map(r => r.score));
        const scoreDiff = highestScore - lowestScore;
        
        if (scoreDiff > 30) {
            insights.push("Significant quality gap detected between repositories");
        } else if (scoreDiff < 10) {
            insights.push("All repositories show similar quality levels");
        }
        
        return insights;
    };

    const generateRecommendations = (data: ComparisonData[]) => {
        const recommendations = [];
        const lowestScoring = data.reduce((prev, current) => prev.score < current.score ? prev : current);
        
        recommendations.push(`${getRepoName(lowestScoring.repoUrl)} could benefit from: ${lowestScoring.roadmap[0]?.title || 'general improvements'}`);
        
        return recommendations;
    };

    const getRepoName = (url: string) => {
        return url.split('/').slice(-2).join('/');
    };

    const getRankIcon = (index: number) => {
        switch (index) {
            case 0: return <Crown className="text-yellow-400" size={20} />;
            case 1: return <Medal className="text-gray-400" size={20} />;
            case 2: return <Award className="text-amber-600" size={20} />;
            default: return <div className="w-5 h-5 rounded-full bg-gray-600 text-white text-xs flex items-center justify-center">{index + 1}</div>;
        }
    };

    return (
        <main className="min-h-screen bg-[#050505] text-white overflow-x-hidden selection:bg-cyan-500/30">
            <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
            
            <div className="relative z-10 max-w-7xl mx-auto p-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-4 mb-8"
                >
                    <Link 
                        href="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to Home
                    </Link>
                    <div className="h-6 w-px bg-gray-700"></div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500 flex items-center gap-3">
                        <GitCompare size={32} />
                        Repository Comparison
                    </h1>
                </motion.div>

                {/* Input Section */}
                {!comparisonData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 backdrop-blur-sm mb-8"
                    >
                        <h2 className="text-xl font-bold text-white mb-6">Compare Repositories</h2>
                        
                        <div className="space-y-4 mb-6">
                            {repos.map((repo, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center font-bold">
                                        {index + 1}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Repository ${index + 1} URL (e.g., https://github.com/user/repo)`}
                                        value={repo}
                                        onChange={(e) => updateRepo(index, e.target.value)}
                                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none transition-colors"
                                    />
                                    {repos.length > 2 && (
                                        <button
                                            onClick={() => removeRepo(index)}
                                            className="text-red-400 hover:text-red-300 transition-colors p-2"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={addRepo}
                                    disabled={repos.length >= 4}
                                    className="text-sm text-gray-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    + Add Repository (max 4)
                                </button>
                                
                                <button
                                    onClick={async () => {
                                        setLoading(true);
                                        const { loadComparisonDemo } = await import('@/lib/comparisonDemoData');
                                        const demoData = await loadComparisonDemo() as any;
                                        setComparisonData(demoData);
                                        setAnalysis(generateComparisonAnalysis(demoData));
                                        setLoading(false);
                                    }}
                                    disabled={loading}
                                    className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors underline decoration-cyan-400/30 underline-offset-4"
                                >
                                    Try Demo Comparison
                                </button>
                            </div>

                            <button
                                onClick={handleCompare}
                                disabled={loading || repos.filter(r => r.trim()).length < 2}
                                className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 font-medium"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <GitCompare size={16} />
                                        Compare Repositories
                                    </>
                                )}
                            </button>
                        </div>

                        {error && (
                            <div className="mt-4 text-red-400 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/50">
                                {error}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Comparison Results */}
                {comparisonData && analysis && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-8"
                    >
                        {/* Winner Announcement */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center bg-linear-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-xl p-8"
                        >
                            <Crown className="mx-auto text-yellow-400 mb-4" size={48} />
                            <h2 className="text-2xl font-bold text-white mb-2">Winner</h2>
                            <h3 className="text-3xl font-black text-yellow-400 mb-2">
                                {getRepoName(analysis.winner.repoUrl)}
                            </h3>
                            <div className="text-6xl font-black text-white mb-2">{analysis.winner.score}</div>
                            <div className="text-yellow-400 font-medium">{analysis.winner.level} Level</div>
                        </motion.div>

                        {/* Rankings */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {analysis.rankings.map((repo: ComparisonData, index: number) => (
                                <motion.div
                                    key={repo.repoUrl}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={clsx(
                                        "bg-gray-900/50 border rounded-xl p-6 backdrop-blur-sm",
                                        index === 0 ? "border-yellow-500/50 bg-yellow-500/5" :
                                        index === 1 ? "border-gray-400/50 bg-gray-400/5" :
                                        index === 2 ? "border-amber-600/50 bg-amber-600/5" :
                                        "border-gray-800"
                                    )}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            {getRankIcon(index)}
                                            <span className="text-sm text-gray-400">#{index + 1}</span>
                                        </div>
                                        {repo.usingFallback && (
                                            <span className="text-xs text-yellow-400">Fallback</span>
                                        )}
                                    </div>
                                    
                                    <h3 className="font-bold text-lg mb-2 text-cyan-400 wrap-break-word">
                                        {getRepoName(repo.repoUrl)}
                                    </h3>
                                    
                                    <div className="text-center mb-4">
                                        <div className="text-4xl font-bold text-white mb-1">{repo.score}</div>
                                        <div className="text-purple-400 font-medium">{repo.level}</div>
                                    </div>
                                    
                                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{repo.summary}</p>
                                    
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-green-400">Strengths</span>
                                            <span className="text-green-400">{repo.strengths?.length || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-red-400">Improvements</span>
                                            <span className="text-red-400">{repo.weaknesses?.length || 0}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Category Analysis */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-gray-900/50 border border-gray-800 rounded-xl p-8 backdrop-blur-sm"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                                <TrendingUp size={24} />
                                Category Analysis
                            </h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {analysis.categories.map((category: any, index: number) => (
                                    <div key={category.name} className="space-y-4">
                                        <h3 className="font-bold text-lg text-purple-400">{category.name}</h3>
                                        <div className="space-y-2">
                                            {category.scores.map((item: any, i: number) => (
                                                <div key={i} className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-300 truncate">{item.repo}</span>
                                                    <span className="text-sm font-medium text-white">{item.score}</span>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="text-xs text-cyan-400">
                                            Winner: {getRepoName(category.winner.repoUrl)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Insights & Recommendations */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
                            >
                                <h3 className="text-lg font-bold text-cyan-400 mb-4">Key Insights</h3>
                                <ul className="space-y-2">
                                    {analysis.insights.map((insight: string, index: number) => (
                                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                            <span className="text-cyan-400 mt-1">•</span>
                                            {insight}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
                            >
                                <h3 className="text-lg font-bold text-purple-400 mb-4">Recommendations</h3>
                                <ul className="space-y-2">
                                    {analysis.recommendations.map((rec: string, index: number) => (
                                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                                            <span className="text-purple-400 mt-1">→</span>
                                            {rec}
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        </div>

                        {/* New Comparison Button */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="text-center"
                        >
                            <button
                                onClick={() => {
                                    setComparisonData(null);
                                    setAnalysis(null);
                                    setRepos(["", ""]);
                                }}
                                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                            >
                                Compare Different Repositories
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </div>
        </main>
    );
}