import { defineConfig } from "oxfmt";

export default defineConfig({
    printWidth: 120,
    tabWidth: 4,
    useTabs: false,
    semi: true,
    singleQuote: false,
    trailingComma: "none",
    endOfLine: "lf",
    bracketSameLine: true,
    htmlWhitespaceSensitivity: "ignore",
    sortImports: { sortSideEffects: false },
    sortPackageJson: true,
    sortTailwindcss: { stylesheet: "./src/app/globals.css", functions: ["cn", "clsx", "cva"] },
    overrides: [{ files: ["**/*.{yml,yaml}"], options: { tabWidth: 2 } }],
    ignorePatterns: [
        ".next/**",
        "dist/**",
        "out/**",
        "build/**",
        "coverage/**",
        "reports/**",
        "pnpm-lock.yaml",
        "next-env.d.ts",
        "AGENTS.md",
        "CLAUDE.md"
    ]
});
