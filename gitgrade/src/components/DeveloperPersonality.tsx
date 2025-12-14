"use client";

import { motion } from "framer-motion";
import { User, Brain, Zap, Shield, Target, Coffee } from "lucide-react";
import clsx from "clsx";

interface PersonalityProps {
    data: {
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
    };
    repoContext?: {
        hasTests: boolean;
        hasCI: boolean;
        readme: string | null;
        commits: Array<{
            message: string;
            author: string;
            date: string;
        }>;
    };
}

export default function DeveloperPersonality({ data }: PersonalityProps) {
    const personality = analyzePersonality(data);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
        >
            <h3 className="text-lg font-bold text-pink-400 mb-4 flex items-center gap-2">
                <Brain size={20} />
                Developer Personality
            </h3>

            <div className="space-y-4">
                {/* Primary Type */}
                <div className="text-center p-4 bg-linear-to-r from-pink-500/10 to-purple-500/10 rounded-lg border border-pink-500/20">
                    <div className="text-2xl mb-2">{personality.emoji}</div>
                    <h4 className="font-bold text-white text-lg">{personality.type}</h4>
                    <p className="text-gray-400 text-sm mt-1">{personality.description}</p>
                </div>

                {/* Traits */}
                <div className="grid grid-cols-2 gap-3">
                    {personality.traits.map((trait, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 1.1 + index * 0.1 }}
                            className="flex items-center gap-2 p-3 bg-gray-800/50 rounded-lg"
                        >
                            <div className="text-pink-400">{trait.icon}</div>
                            <div>
                                <div className="text-white text-sm font-medium">{trait.name}</div>
                                <div className="text-gray-500 text-xs">{trait.level}/5</div>
                            </div>
                            <div className="ml-auto flex gap-1">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={clsx(
                                            "w-2 h-2 rounded-full",
                                            i < trait.level ? "bg-pink-400" : "bg-gray-700"
                                        )}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Fun Fact */}
                <div className="p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <p className="text-purple-300 text-sm">
                        <Coffee size={14} className="inline mr-1" />
                        <strong>Fun Fact:</strong> {personality.funFact}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function analyzePersonality(data: PersonalityProps['data']) {
    const score = data.score;
    const hasTests = data.strengths?.some((s: string) => s.toLowerCase().includes('test'));
    const hasCI = data.strengths?.some((s: string) => s.toLowerCase().includes('ci'));
    const hasDocumentation = data.strengths?.some((s: string) => s.toLowerCase().includes('readme') || s.toLowerCase().includes('documentation'));
    
    // Determine primary personality type
    let type, emoji, description, funFact;
    
    if (score >= 85 && hasTests && hasCI) {
        type = "The Perfectionist";
        emoji = "🎯";
        description = "Meticulous attention to detail with enterprise-grade practices";
        funFact = "You probably have more test files than actual code files";
    } else if (score >= 70 && hasDocumentation) {
        type = "The Communicator";
        emoji = "📚";
        description = "Values clarity and helps others understand the code";
        funFact = "Your README is probably longer than most people's resumes";
    } else if (hasTests && score >= 60) {
        type = "The Pragmatist";
        emoji = "⚡";
        description = "Balances quality with delivery speed";
        funFact = "You write tests, but only for the important stuff";
    } else if (score >= 50) {
        type = "The Explorer";
        emoji = "🚀";
        description = "Focuses on innovation and rapid prototyping";
        funFact = "You move fast and break things (but fix them later)";
    } else {
        type = "The Learner";
        emoji = "🌱";
        description = "Growing skills with each commit";
        funFact = "Every bug is just an undocumented feature waiting to happen";
    }

    // Calculate trait levels
    const traits = [
        {
            name: "Quality Focus",
            icon: <Shield size={14} />,
            level: Math.min(5, Math.floor((score / 100) * 5) + (hasTests ? 1 : 0))
        },
        {
            name: "Documentation",
            icon: <User size={14} />,
            level: hasDocumentation ? Math.min(5, 4 + (score > 80 ? 1 : 0)) : Math.max(1, Math.floor(score / 25))
        },
        {
            name: "Automation",
            icon: <Zap size={14} />,
            level: hasCI ? Math.min(5, 4 + (score > 85 ? 1 : 0)) : Math.max(1, Math.floor(score / 30))
        },
        {
            name: "Innovation",
            icon: <Target size={14} />,
            level: Math.min(5, Math.max(2, Math.floor((100 - score) / 20) + 2))
        }
    ];

    return {
        type,
        emoji,
        description,
        traits,
        funFact
    };
}