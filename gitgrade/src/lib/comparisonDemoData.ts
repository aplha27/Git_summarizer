export const COMPARISON_DEMO_DATA = [
    {
        repoUrl: "https://github.com/facebook/react",
        score: 98,
        level: "Elite",
        summary: "A masterclass in modern library design. The codebase defines the industry standard, though purely functional patterns might alienate object-oriented purists.",
        strengths: [
            "Monorepo architecture with optimized workspace management",
            "Comprehensive test coverage using Jest",
            "Clean separation of reconciler and renderer",
            "Zero-dependency core architecture"
        ],
        weaknesses: [
            "Legacy commit history adds significant bloat",
            "Complex build system has a steep learning curve",
            "Some internal flow types are esoteric"
        ],
        roadmap: [
            {
                title: "Migrate to TypeScript",
                description: "Flow is dying. It's time to fully embrace TypeScript for better community contribution.",
                priority: "High"
            },
            {
                title: "Reduce Bundle Size",
                description: "The experimental builds are getting heavy. Optimize the scheduler.",
                priority: "Medium"
            }
        ],
        usingFallback: false
    },
    {
        repoUrl: "https://github.com/vuejs/vue",
        score: 94,
        level: "Elite",
        summary: "Elegant and approachable framework with excellent developer experience. The progressive nature makes it perfect for gradual adoption.",
        strengths: [
            "Excellent documentation and learning curve",
            "Template syntax is intuitive and powerful",
            "Strong ecosystem with official libraries",
            "Great performance optimizations"
        ],
        weaknesses: [
            "Smaller community compared to React",
            "Less job market demand",
            "TypeScript support could be better"
        ],
        roadmap: [
            {
                title: "Enhance TypeScript Integration",
                description: "Improve type inference and IDE support for better developer experience.",
                priority: "High"
            },
            {
                title: "Expand Enterprise Features",
                description: "Add more enterprise-focused tools and patterns.",
                priority: "Medium"
            }
        ],
        usingFallback: false
    },
    {
        repoUrl: "https://github.com/angular/angular",
        score: 89,
        level: "Pro",
        summary: "Enterprise-grade framework with powerful features and strong opinions. The learning curve is steep but the productivity gains are substantial.",
        strengths: [
            "Full-featured framework with everything included",
            "Excellent TypeScript support out of the box",
            "Powerful CLI and development tools",
            "Strong enterprise adoption"
        ],
        weaknesses: [
            "Steep learning curve for beginners",
            "Bundle size can be large",
            "Frequent breaking changes between versions"
        ],
        roadmap: [
            {
                title: "Simplify Learning Path",
                description: "Create more beginner-friendly documentation and tutorials.",
                priority: "High"
            },
            {
                title: "Optimize Bundle Size",
                description: "Improve tree-shaking and reduce default bundle size.",
                priority: "Medium"
            }
        ],
        usingFallback: false
    }
];

export function loadComparisonDemo() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(COMPARISON_DEMO_DATA);
        }, 1500); // Simulate API delay
    });
}