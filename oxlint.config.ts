import { defineConfig } from "oxlint";

export default defineConfig({
    plugins: ["eslint", "typescript", "unicorn", "oxc", "react", "nextjs", "jsx-a11y", "import", "vitest"],
    categories: { correctness: "error" },
    options: { typeAware: true, denyWarnings: true, reportUnusedDisableDirectives: "error" },
    env: { browser: true, node: true, es2025: true },
    ignorePatterns: [".next/**", "dist/**", "out/**", "build/**", "coverage/**", "reports/**", "next-env.d.ts"],
    rules: {
        "eslint/no-unused-vars": [
            "error",
            {
                argsIgnorePattern: "^_",
                varsIgnorePattern: "^_",
                caughtErrorsIgnorePattern: "^_",
                ignoreRestSiblings: true
            }
        ],
        "eslint/eqeqeq": ["error", "always", { null: "ignore" }],
        "eslint/no-var": "error",
        "eslint/prefer-const": "error",
        "eslint/no-debugger": "error",
        "eslint/no-eval": "error",
        "react/rules-of-hooks": "error",
        "react/exhaustive-deps": "error",
        "typescript/consistent-type-imports": [
            "error",
            { prefer: "type-imports", fixStyle: "separate-type-imports", disallowTypeAnnotations: false }
        ],
        "typescript/no-explicit-any": "error",
        "typescript/no-floating-promises": "error",
        "typescript/no-misused-promises": "error",
        "typescript/await-thenable": "error",
        "typescript/switch-exhaustiveness-check": "error",
        "vitest/no-focused-tests": "error",
        "vitest/no-disabled-tests": "error",
        // Inference is preferable to redundant generic annotations on implementation-backed mocks.
        "vitest/require-mock-type-parameters": "off",
        // SVG charts and composite carousel groups legitimately need explicit ARIA roles.
        "jsx-a11y/prefer-tag-over-role": "off"
    },
    settings: { "jsx-a11y": { components: { Link: "a", Image: "img" } } }
});
