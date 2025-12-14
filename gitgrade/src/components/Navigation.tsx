"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Github, GitCompare, Home } from "lucide-react";
import clsx from "clsx";

export default function Navigation() {
    const pathname = usePathname();

    const navItems = [
        { href: "/", label: "Analyze", icon: Home },
        { href: "/compare", label: "Compare", icon: GitCompare },
    ];

    return (
        <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-800"
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="p-2 rounded-lg bg-linear-to-r from-cyan-500 to-purple-600">
                            <Github size={20} className="text-white" />
                        </div>
                        <span className="text-xl font-bold bg-clip-text text-transparent bg-linear-to-r from-cyan-400 to-purple-500">
                            GitGrade
                        </span>
                    </Link>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-1">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={clsx(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors relative",
                                        isActive 
                                            ? "text-white bg-gray-800" 
                                            : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                                    )}
                                >
                                    <Icon size={16} />
                                    <span className="font-medium">{item.label}</span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-linear-to-r from-cyan-500/10 to-purple-500/10 rounded-lg border border-cyan-500/20"
                                        />
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}