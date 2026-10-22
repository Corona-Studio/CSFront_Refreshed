import fs from "node:fs";
import path from "node:path";

import { parseSync, Visitor } from "oxc-parser";
import postcss from "postcss";

export function checkStyles(root = process.cwd()) {
    const sourceRoot = path.join(root, "src");
    const files = fs
        .readdirSync(sourceRoot, { recursive: true, encoding: "utf8" })
        .map((name) => path.join(sourceRoot, name));
    const stylesheets = files.filter((file) => file.endsWith(".css"));
    const sources = files.filter((file) => /\.[jt]sx?$/.test(file));
    const globalFiles = new Set([
        "src/app/globals.css",
        "src/styles/theme.css",
        "src/styles/base.css",
        "src/styles/shared.css"
    ]);
    const referenced = new Set<string>();
    const classes = new Map<string, Set<string>>();
    const errors: string[] = [];
    const relativePath = (file: string) => path.relative(root, file).split(path.sep).join("/");
    const report = (file: string, line: number, message: string) =>
        errors.push(`${path.relative(root, file)}:${line}: ${message}`);
    const resolve = (file: string, specifier: string) =>
        path.resolve(specifier.startsWith("@/") ? sourceRoot : path.dirname(file), specifier.replace(/^@\//, ""));

    for (const file of stylesheets) {
        const relative = relativePath(file);
        if (!file.endsWith(".module.css") && !globalFiles.has(relative))
            report(file, 1, "Component CSS must use .module.css.");
        const tree = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
        if (
            tree.nodes.some(
                (node) => node.type === "atrule" && node.name === "layer" && node.params === "components"
            ) &&
            !tree.nodes.some(
                (node) =>
                    node.type === "atrule" &&
                    node.name === "layer" &&
                    !node.nodes &&
                    node.params === "theme, base, components, utilities"
            )
        ) {
            report(
                file,
                1,
                "Declare the complete cascade layer order before component rules so route chunks cannot reorder layers."
            );
        }
        const names = new Set<string>();
        tree.walkRules((rule) => {
            // Global hooks do not export module class names.
            const local = rule.selector.replace(/:global\([^)]*\)/g, "");
            for (const match of local.matchAll(/\.([A-Za-z_][\w-]*)/g)) names.add(match[1]);
            const declarations = new Set<string>();
            rule.each((node) => {
                if (node.type !== "decl") return;
                const signature = `${node.prop}:${node.value}:${Boolean(node.important)}`;
                if (declarations.has(signature))
                    report(file, node.source?.start?.line ?? 1, `Duplicate declaration: ${node.prop}.`);
                declarations.add(signature);
            });
        });
        tree.walkDecls((decl) => {
            if (decl.important && relative !== "src/styles/base.css")
                report(
                    file,
                    decl.source?.start?.line ?? 1,
                    "Use specificity, a component variant, or a CSS variable instead of !important."
                );
        });
        tree.walkAtRules("import", (rule) => {
            const match = rule.params.match(/^["']([^"']+\.css)["']/);
            if (match) referenced.add(resolve(file, match[1]));
        });
        classes.set(file, names);
    }

    for (const file of sources) {
        const text = fs.readFileSync(file, "utf8");
        const source = parseSync(file, text);
        const lineAt = (offset: number) => text.slice(0, offset).split("\n").length;
        for (const error of source.errors) {
            report(file, lineAt(error.labels[0]?.start ?? 0), `Source parse error: ${error.message}`);
        }
        const modules = new Map<string, string>();
        for (const statement of source.program.body) {
            if (statement.type !== "ImportDeclaration") continue;
            const specifier = statement.source.value;
            if (!specifier.endsWith(".css")) continue;
            const target = resolve(file, specifier);
            referenced.add(target);
            if (!classes.has(target)) report(file, 1, `Stylesheet does not exist: ${specifier}.`);
            if (!specifier.endsWith(".module.css") && relativePath(file) !== "src/app/layout.tsx")
                report(file, 1, "Only the root layout may import global CSS.");
            const binding = statement.specifiers.find((specifier) => specifier.type === "ImportDefaultSpecifier");
            if (binding) modules.set(binding.local.name, target);
        }
        new Visitor({
            JSXOpeningElement(node) {
                if (node.name.type !== "JSXIdentifier" || node.name.name !== "style") return;
                report(
                    file,
                    lineAt(node.start),
                    "Move runtime style tags to CSS Modules; pass instance values through style or CSS variables."
                );
            },
            MemberExpression(node) {
                if (node.object.type !== "Identifier") return;
                const owner = node.object.name;
                const name =
                    !node.computed && node.property.type === "Identifier"
                        ? node.property.name
                        : node.computed && node.property.type === "Literal" && typeof node.property.value === "string"
                          ? node.property.value
                          : undefined;
                const target = modules.get(owner);
                // Only literal CSS Module keys can be validated by this static audit.
                if (target && name !== undefined && !classes.get(target)?.has(name)) {
                    report(file, lineAt(node.start), `Missing CSS Module class: ${owner}.${name}.`);
                }
            }
        }).visit(source.program);
    }
    for (const file of stylesheets)
        if (!referenced.has(file)) report(file, 1, "Unreferenced stylesheet; remove it or import it from its owner.");
    return { errors, stylesheetCount: stylesheets.length };
}

if (import.meta.main) {
    const { errors, stylesheetCount } = checkStyles();
    if (errors.length) {
        console.error(errors.join("\n"));
        process.exitCode = 1;
    } else {
        console.log(
            `Style checks passed (${stylesheetCount} stylesheets): imports, module references, duplicate declarations, and global boundaries.`
        );
    }
}
