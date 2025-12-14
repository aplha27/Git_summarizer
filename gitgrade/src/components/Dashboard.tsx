"use client";

import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertTriangle, Play, Star, GitFork, AlertCircle } from "lucide-react";
import clsx from "clsx";
import HealthInsights from "./HealthInsights";
import DeveloperPersonality from "./DeveloperPersonality";
import ShareableCard from "./ShareableCard";

interface DashboardProps {
    data: any;
    repoUrl: string;
}

export default function Dashboard({ data, repoUrl }: DashboardProps) {
    const { score, level, summary, strengths, weaknesses, roadmap, usingFallback } = data;

    const scoreColor =
        score >= 90 ? "text-green-400" : score >= 70 ? "text-yellow-400" : "text-red-500";

    const circleCircumference = 2 * Math.PI * 120; // r=120
    const strokeDashoffset = circleCircumference - (score / 100) * circleCircumference;

    return (
        <div className="w-full max-w-6xl mx-auto p-6 space-y-8 text-white min-h-screen font-mono">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center border-b border-gray-800 pb-4"
            >
                <div>
                    <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500">
                        GIT GRADE
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">{repoUrl}</p>
                    {usingFallback && (
                        <p className="text-yellow-400 text-xs mt-1 flex items-center gap-1">
                            <AlertCircle size={12} />
                            Using basic analysis (AI quota exceeded)
                        </p>
                    )}
                </div>
                <div className="flex gap-4">
                    <Badge label={level} color="bg-purple-900 text-purple-200" />
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Verdict & Stats */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6"
                >
                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl backdrop-blur-sm">
                        <h2 className="text-xl font-bold mb-4 text-cyan-400">Verdict</h2>
                        <p className="text-gray-300 leading-relaxed text-lg italic">"{summary}"</p>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 text-green-400 flex items-center gap-2"><CheckCircle size={18} /> Strengths</h3>
                        <ul className="space-y-2">
                            {strengths.map((s: string, i: number) => (
                                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                    <span className="text-green-500 mt-1">▹</span> {s}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl backdrop-blur-sm">
                        <h3 className="text-lg font-bold mb-4 text-red-400 flex items-center gap-2"><XCircle size={18} /> Weaknesses</h3>
                        <ul className="space-y-2">
                            {weaknesses.map((w: string, i: number) => (
                                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                                    <span className="text-red-500 mt-1">▹</span> {w}
                                </li>
                            ))}
                        </ul>
                    </div>
                </motion.div>

                {/* Center: Score Gauge */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col items-center justify-center bg-gray-900/30 rounded-2xl border border-gray-800/50 p-8 shadow-2xl relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full" />

                    {/* Simple SVG Gauge */}
                    <div className="relative w-64 h-64 flex items-center justify-center">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="50%" cy="50%" r="120"
                                stroke="#1f2937" strokeWidth="20" fill="transparent"
                            />
                            <motion.circle
                                cx="50%" cy="50%" r="120"
                                stroke="currentColor" strokeWidth="20" fill="transparent"
                                className={scoreColor}
                                strokeDasharray={circleCircumference}
                                strokeDashoffset={circleCircumference}
                                strokeLinecap="round"
                                animate={{ strokeDashoffset }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={clsx("text-6xl font-black tracking-tighter", scoreColor)}
                            >
                                {score}
                            </motion.span>
                            <span className="text-gray-500 uppercase tracking-widest text-xs mt-2">Score</span>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-2 gap-8 text-center w-full">
                        {/* Note: In a real app we'd pass these derived stats or get them from analysis */}
                        <div>
                            <h4 className="text-gray-500 text-xs uppercase tracking-widest">Quality</h4>
                            <p className="text-xl font-bold text-white">High</p>
                        </div>
                        <div>
                            <h4 className="text-gray-500 text-xs uppercase tracking-widest">Security</h4>
                            <p className="text-xl font-bold text-white">Med</p>
                        </div>
                    </div>
                </motion.div>

                {/* Right Column: Roadmap */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gray-900/50 border border-gray-800 p-6 rounded-xl backdrop-blur-sm h-full"
                >
                    <h2 className="text-xl font-bold mb-6 text-purple-400 flex items-center gap-2">
                        <Play size={20} className="fill-purple-400" /> Action Plan
                    </h2>

                    <div className="space-y-6 relative before:absolute before:left-[9px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-800">
                        {roadmap.map((item: any, i: number) => (
                            <div key={i} className="pl-8 relative">
                                <div className="absolute left-0 top-1 w-5 h-5 rounded-full bg-gray-900 border-2 border-purple-500 z-10" />
                                <h4 className="font-bold text-gray-200 flex justify-between">
                                    {item.title}
                                    <span className={clsx("text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider",
                                        item.priority === "High" ? "bg-red-900/50 text-red-400" :
                                            item.priority === "Medium" ? "bg-yellow-900/50 text-yellow-400" :
                                                "bg-blue-900/50 text-blue-400"
                                    )}>{item.priority}</span>
                                </h4>
                                <p className="text-sm text-gray-400 mt-1">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* New Features Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                <HealthInsights data={data} />
                <DeveloperPersonality data={data} />
            </div>

            {/* Share Button */}
            <div className="flex justify-center mt-8">
                <ShareableCard data={data} repoUrl={repoUrl} />
            </div>
        </div>
    );
}

function Badge({ label, color }: { label: string, color: string }) {
    return (
        <span className={clsx("px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider", color)}>
            {label}
        </span>
    );
}
