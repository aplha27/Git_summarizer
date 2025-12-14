"use client";

import { motion } from "framer-motion";
import { GitCompare } from "lucide-react";
import Link from "next/link";

export default function ComparisonMode() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
        >
            <Link
                href="/compare"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium shadow-lg hover:shadow-purple-500/25"
            >
                <GitCompare size={18} />
                Compare Repositories
            </Link>
        </motion.div>
    );
}