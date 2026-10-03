import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";
import ts from "typescript";

const root = process.cwd();
const sourceRoot = path.join(root, "src");
const files = fs.readdirSync(sourceRoot, { recursive: true }).map((name) => path.join(sourceRoot, name));
const stylesheets = files.filter((file) => file.endsWith(".css"));
const sources = files.filter((file) => /\.[jt]sx?$/.test(file));
const globalFiles = new Set([
    "src/app/globals.css",
    "src/styles/theme.css",
    "src/styles/base.css",
    "src/styles/shared.css"
]);
const referenced = new Set();
const classes = new Map();
const errors = [];
const report = (file, line, message) => errors.push(`${path.relative(root, file)}:${line}: ${message}`);
const resolve = (file, specifier) =>
    path.resolve(specifier.startsWith("@/") ? sourceRoot : path.dirname(file), specifier.replace(/^@\//, ""));

for (const file of stylesheets) {
    const relative = path.relative(root, file);
    if (!file.endsWith(".module.css") && !globalFiles.has(relative))
        report(file, 1, "Component CSS must use .module.css.");
    const tree = postcss.parse(fs.readFileSync(file, "utf8"), { from: file });
    if (
        tree.nodes.some((node) => node.type === "atrule" && node.name === "layer" && node.params === "components") &&
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
    const names = new Set();
    tree.walkRules((rule) => {
        // Global hooks do not export module class names.
        const local = rule.selector.replace(/:global\([^)]*\)/g, "");
        for (const match of local.matchAll(/\.([A-Za-z_][\w-]*)/g)) names.add(match[1]);
        const declarations = new Set();
        rule.each((node) => {
            if (node.type !== "decl") return;
            const signature = `${node.prop}:${node.value}:${Boolean(node.important)}`;
            if (declarations.has(signature))
                report(file, node.source.start.line, `Duplicate declaration: ${node.prop}.`);
            declarations.add(signature);
        });
    });
    tree.walkDecls((decl) => {
        if (decl.important && relative !== "src/styles/base.css")
            report(
                file,
                decl.source.start.line,
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
    const source = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
    const modules = new Map();
    for (const statement of source.statements) {
        if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier)) continue;
        const specifier = statement.moduleSpecifier.text;
        if (!specifier.endsWith(".css")) continue;
        const target = resolve(file, specifier);
        referenced.add(target);
        if (!classes.has(target)) report(file, 1, `Stylesheet does not exist: ${specifier}.`);
        if (!specifier.endsWith(".module.css") && path.relative(root, file) !== "src/app/layout.tsx")
            report(file, 1, "Only the root layout may import global CSS.");
        if (statement.importClause?.name) modules.set(statement.importClause.name.text, target);
    }
    function visit(node) {
        const line = source.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        if (
            (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
            node.tagName.getText(source) === "style"
        )
            report(
                file,
                line,
                "Move runtime style tags to CSS Modules; pass instance values through style or CSS variables."
            );
        let owner, name;
        if (ts.isPropertyAccessExpression(node) && ts.isIdentifier(node.expression)) {
            owner = node.expression.text;
            name = node.name.text;
        } else if (
            ts.isElementAccessExpression(node) &&
            ts.isIdentifier(node.expression) &&
            ts.isStringLiteral(node.argumentExpression)
        ) {
            owner = node.expression.text;
            name = node.argumentExpression.text;
        }
        if (modules.has(owner) && !classes.get(modules.get(owner))?.has(name))
            report(file, line, `Missing CSS Module class: ${owner}.${name}.`);
        ts.forEachChild(node, visit);
    }
    visit(source);
}
for (const file of stylesheets)
    if (!referenced.has(file)) report(file, 1, "Unreferenced stylesheet; remove it or import it from its owner.");
if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
} else {
    console.log(
        `Style checks passed (${stylesheets.length} stylesheets): imports, module references, duplicate declarations, and global boundaries.`
    );
}
