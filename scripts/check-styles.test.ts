import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { checkStyles } from "./check-styles";

const roots: string[] = [];
afterEach(() => {
    for (const root of roots.splice(0)) fs.rmSync(root, { recursive: true, force: true });
});

function fixture(files: Record<string, string>) {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "csfront-styles-"));
    roots.push(root);
    for (const [name, content] of Object.entries(files)) {
        const target = path.join(root, "src", name);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, content);
    }
    return root;
}

describe("style audit with the Oxc TypeScript parser", () => {
    it("resolves aliased imports, literal keys, optional access, and Unicode source locations", () => {
        const root = fixture({
            "app/Panel.module.css": ".panel { color: red; }",
            "app/Panel.tsx":
                'import styles from "@/app/Panel.module.css";\nconst label = "中文 🎉";\nexport const Panel = ({ name }: { name: string }) => <div className={styles.panel + styles["panel"] + styles?.panel + styles[name]}>{label}</div>;'
        });
        expect(checkStyles(root)).toEqual({ errors: [], stylesheetCount: 1 });
        fs.appendFileSync(path.join(root, "src/app/Panel.tsx"), '\nstyles["missing"];\nstyles.missing;');
        const { errors } = checkStyles(root);
        expect(errors).toHaveLength(2);
        expect(errors[0]).toContain("Panel.tsx:4: Missing CSS Module class: styles.missing.");
        expect(errors[1]).toContain("Panel.tsx:5: Missing CSS Module class: styles.missing.");
    });

    it("reports missing imports, global CSS outside layout, inline style tags, and orphan styles", () => {
        const root = fixture({
            "app/globals.css": ":root { color: red; }",
            "app/Orphan.module.css": ".unused { color: red; }",
            "app/Panel.tsx":
                'import "./globals.css";\nimport styles from "./missing.module.css";\nexport const Panel = () => <><style>{"div {}"}</style><style /></>;'
        });
        const { errors } = checkStyles(root);
        expect(errors.some((error) => error.includes("Stylesheet does not exist"))).toBe(true);
        expect(errors.some((error) => error.includes("Only the root layout"))).toBe(true);
        expect(errors.filter((error) => error.includes("Move runtime style tags"))).toHaveLength(2);
        expect(errors.some((error) => error.includes("Unreferenced stylesheet"))).toBe(true);
    });

    it("keeps cascade, duplicate declaration, !important, and parse-error checks", () => {
        const root = fixture({
            "app/layout.tsx": 'import "./globals.css"; import "./Panel.module.css";',
            "app/globals.css": ":root { color: red; }",
            "app/Panel.module.css":
                "@layer components { .panel { color: red; color: red; display: block !important; } }",
            "app/broken.tsx": "export const = ;"
        });
        const { errors } = checkStyles(root);
        for (const message of [
            "cascade layer order",
            "Duplicate declaration",
            "instead of !important",
            "Source parse error"
        ]) {
            expect(errors.some((error) => error.includes(message))).toBe(true);
        }
    });
});
