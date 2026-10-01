import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
    { ignores: ["dist/**", ".next/**", "out/**", "src/ReactBits/**", "next-env.d.ts"] },
    {
        extends: [js.configs.recommended, ...tseslint.configs.recommended, eslintConfigPrettier],
        files: ["**/*.{ts,tsx}"],
        languageOptions: { globals: { ...globals.browser, ...globals.node } },
        plugins: { "react-hooks": reactHooks },
        rules: {
            ...reactHooks.configs.recommended.rules,
            "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }]
        }
    }
);
