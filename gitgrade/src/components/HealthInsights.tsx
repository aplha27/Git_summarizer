"use client";

import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Clock, Users, Code, GitBranch } from "lucide-react";
import clsx from "clsx";

interface HealthInsightsProps {
    data: any;
}

export default function HealthInsights({ data }: HealthInsightsProps) {
    const insights = generateInsights(data);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm"
        >
            <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                <TrendingUp size={20} />
                Health Insights
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {insights.map((insight, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                        className={clsx(
                            "p-4 rounded-lg border-l-4 flex items-start gap-3",
                            insight.type === "positive" ? "bg-green-900/20 border-green-500" :
                            insight.type === "warning" ? "bg-yellow-900/20 border-yellow-500" :
                            "bg-red-900/20 border-red-500"
                        )}
                    >
                        <div className={clsx(
                            "p-1 rounded-full",
                            insight.type === "positive" ? "bg-green-500/20 text-green-400" :
                            insight.type === "warning" ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                        )}>
                            {insight.icon}
                        </div>
                        <div>
                            <h4 className="font-semibold text-white text-sm">{insight.title}</h4>
                            <p className="text-gray-400 text-xs mt-1">{insight.description}</p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}

function generateInsights(data: any) {
    const insights = [];

    // Score-based insights
    if (data.score >= 85) {
        insights.push({
            type: "positive",
            icon: <CheckCircle size={16} />,
            title: "Excellent Quality",
            description: "This repository demonstrates professional-grade development practices."
        });
    } else if (data.score < 50) {
        insights.push({
            type: "critical",
            icon: <AlertTriangle size={16} />,
            title: "Needs Attention",
            description: "Multiple areas require improvement to meet industry standards."
        });
    }

    // Testing insights
    if (data.strengths?.some((s: string) => s.toLowerCase().includes('test'))) {
        insights.push({
            type: "positive",
            icon: <CheckCircle size={16} />,
            title: "Testing Culture",
            description: "Good testing practices indicate maintainable, reliable code."
        });
    } else {
        insights.push({
            type: "critical",
            icon: <Code size={16} />,
            title: "Testing Gap",
            description: "Adding tests would significantly improve code reliability and maintainability."
        });
    }

    // Documentation insights
    if (data.strengths?.some((s: string) => s.toLowerCase().includes('readme') || s.toLowerCase().includes('documentation'))) {
        insights.push({
            type: "positive",
            icon: <Users size={16} />,
            title: "Developer Friendly",
            description: "Good documentation makes the project accessible to contributors."
        });
    }

    // CI/CD insights
    if (data.strengths?.some((s: string) => s.toLowerCase().includes('ci'))) {
        insights.push({
            type: "positive",
            icon: <GitBranch size={16} />,
            title: "Automated Workflow",
            description: "CI/CD setup ensures consistent quality and deployment processes."
        });
    } else {
        insights.push({
            type: "warning",
            icon: <Clock size={16} />,
            title: "Manual Processes",
            description: "Automation could reduce errors and speed up development cycles."
        });
    }

    // Roadmap priority insights
    const highPriorityItems = data.roadmap?.filter((item: any) => item.priority === "High").length || 0;
    if (highPriorityItems > 2) {
        insights.push({
            type: "warning",
            icon: <TrendingUp size={16} />,
            title: "Growth Opportunity",
            description: `${highPriorityItems} high-priority improvements identified for rapid quality gains.`
        });
    }

    return insights.slice(0, 6); // Limit to 6 insights
}