"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Share2, Download, Copy, Check, Twitter, Linkedin, Github } from "lucide-react";
import clsx from "clsx";

interface ShareableCardProps {
    data: any;
    repoUrl: string;
}

export default function ShareableCard({ data, repoUrl }: ShareableCardProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    const shareUrl = `${window.location.origin}?repo=${encodeURIComponent(repoUrl)}&score=${data.score}`;
    const repoName = repoUrl.split('/').slice(-2).join('/');

    const shareText = `🚀 Just analyzed my repository "${repoName}" with GitGrade!\n\n📊 Score: ${data.score}/100\n🏆 Level: ${data.level}\n\n${data.summary}\n\nCheck it out: ${shareUrl}`;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const shareToTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
    };

    const shareToLinkedIn = () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        window.open(linkedinUrl, '_blank');
    };

    const downloadReport = () => {
        const reportData = {
            repository: repoName,
            analyzedAt: new Date().toISOString(),
            score: data.score,
            level: data.level,
            summary: data.summary,
            strengths: data.strengths,
            weaknesses: data.weaknesses,
            roadmap: data.roadmap
        };

        const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `gitgrade-report-${repoName.replace('/', '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    if (!isOpen) {
        return (
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            >
                <Share2 size={16} />
                Share Results
            </motion.button>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsOpen(false)}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-md w-full"
            >
                <h3 className="text-lg font-bold text-cyan-400 mb-4 flex items-center gap-2">
                    <Share2 size={20} />
                    Share Your Results
                </h3>

                {/* Preview Card */}
                <div className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700">
                    <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-white text-sm">{repoName}</h4>
                        <span className={clsx(
                            "px-2 py-1 rounded text-xs font-bold",
                            data.score >= 80 ? "bg-green-500/20 text-green-400" :
                            data.score >= 60 ? "bg-yellow-500/20 text-yellow-400" :
                            "bg-red-500/20 text-red-400"
                        )}>
                            {data.score}/100
                        </span>
                    </div>
                    <p className="text-gray-400 text-xs mb-2">{data.level} Level</p>
                    <p className="text-gray-300 text-xs">{data.summary.slice(0, 100)}...</p>
                </div>

                {/* Share Options */}
                <div className="space-y-3">
                    <button
                        onClick={copyToClipboard}
                        className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                        <span>{copied ? "Copied!" : "Copy to Clipboard"}</span>
                    </button>

                    <button
                        onClick={shareToTwitter}
                        className="w-full flex items-center gap-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-white"
                    >
                        <Twitter size={16} />
                        <span>Share on Twitter</span>
                    </button>

                    <button
                        onClick={shareToLinkedIn}
                        className="w-full flex items-center gap-3 p-3 bg-blue-800 hover:bg-blue-900 rounded-lg transition-colors text-white"
                    >
                        <Linkedin size={16} />
                        <span>Share on LinkedIn</span>
                    </button>

                    <button
                        onClick={downloadReport}
                        className="w-full flex items-center gap-3 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors text-white"
                    >
                        <Download size={16} />
                        <span>Download Report</span>
                    </button>
                </div>

                <button
                    onClick={() => setIsOpen(false)}
                    className="w-full mt-4 p-2 text-gray-400 hover:text-white transition-colors"
                >
                    Close
                </button>
            </motion.div>
        </motion.div>
    );
}