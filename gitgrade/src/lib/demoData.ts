export const REACT_DEMO_DATA = {
    score: 98,
    level: "Elite",
    summary: "A masterclass in modern library design. The codebase defines the industry standard, though purely functional patterns might alienate object-oriented purists.",
    strengths: [
        "Monorepo architecture with optimized workspace management",
        "Comprehensive test coverage using Jest (obviously)",
        "Clean separation of reconciler and renderer",
        "Zero-dependency core architecture"
    ],
    weaknesses: [
        "Legacy commit history adds significant bloat",
        "Complex build system (scripts/rollup) has a steep learning curve",
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
        },
        {
            title: "Update Documentation",
            description: "Several internal APIs are undocumented in the public site.",
            priority: "Low"
        }
    ]
};
