import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { JSDOM } from "jsdom";

const [target = "http://localhost:3217", mode] = process.argv.slice(2);
assert(mode === undefined || mode === "--checks-only", "Optional mode: --checks-only");
const base = new URL(target);
assert(["http:", "https:"].includes(base.protocol), "Use an HTTP(S) production server URL");
const directory = path.resolve("reports/lighthouse");
await mkdir(directory, { recursive: true });
const paths = ["/", "/lx", "/lx/download", "/cmfs"];
const canonicalBase = "https://corona.studio";
const checks = [];
async function fetchOk(route, options) {
    const response = await fetch(new URL(route, base), options);
    assert.equal(response.status, 200, `${route} HTTP status`);
    return response;
}
const sitemap = await (await fetchOk("/sitemap.xml")).text();
const robots = await (await fetchOk("/robots.txt")).text();
assert(robots.includes(`Sitemap: ${canonicalBase}/sitemap.xml`));
for (const privatePath of ["/auth", "/user", "/admin", "/design-system", "/lx/download/thanks"]) {
    if (privatePath === "/auth") assert(!robots.includes("Disallow: /auth"));
    else assert(robots.includes(`Disallow: ${privatePath}`));
    const document = new JSDOM(await (await fetchOk(privatePath === "/auth" ? "/auth/login" : privatePath)).text())
        .window.document;
    assert(document.querySelector('meta[name="robots"]')?.content.includes("noindex"), `${privatePath} noindex`);
}
const index = await (await fetchOk("/index.json")).json();
assert.equal(index.pages.length, paths.length);
const llms = await (await fetchOk("/llms.txt")).text();
const full = await (await fetchOk("/llms-full.txt")).text();
for (const route of paths) {
    const response = await fetchOk(route);
    assert(response.headers.get("content-type").includes("text/html"));
    assert(response.headers.get("vary")?.toLowerCase().includes("accept"));
    const document = new JSDOM(await response.text()).window.document;
    assert(document.title.length > 0);
    assert(document.querySelector('meta[name="description"]')?.content.length > 30);
    assert.equal(document.querySelector('link[rel="canonical"]')?.href, `${canonicalBase}${route}`);
    assert.equal(document.querySelectorAll("h1").length, 1, `${route} H1`);
    const image = document.querySelector('meta[property="og:image"]')?.content;
    assert(image);
    const social = await fetchOk(new URL(image).pathname);
    assert(social.headers.get("content-type").includes("image/png"));
    assert.equal(new DataView(await social.arrayBuffer()).getUint32(16), 1200);
    assert(document.querySelector('meta[name="twitter:card"]'));
    const structured = [...document.querySelectorAll('script[type="application/ld+json"]')].map((script) =>
        JSON.parse(script.textContent)
    );
    assert(
        structured.some((data) => data["@graph"]?.some((item) => ["WebPage", "CollectionPage"].includes(item["@type"])))
    );
    assert(sitemap.includes(`<loc>${canonicalBase}${route}</loc>`));
    const page = index.pages.find((page) => page.url === `${canonicalBase}${route}`);
    assert(page);
    const markdownPath = new URL(page.markdown).pathname;
    const staticResponse = await fetchOk(markdownPath);
    assert(staticResponse.headers.get("content-type").includes("text/markdown"));
    const staticContent = await staticResponse.text();
    const negotiated = await fetchOk(route, { headers: { Accept: "text/markdown" } });
    assert(negotiated.headers.get("content-type").includes("text/markdown"));
    assert(negotiated.headers.get("cache-control").includes("no-store"));
    assert.equal(await negotiated.text(), staticContent);
    assert.equal(page.content, staticContent);
    assert(llms.includes(page.markdown));
    assert(full.includes(staticContent));
    const htmlPreferred = await fetchOk(route, { headers: { Accept: "text/html,text/markdown;q=0.5" } });
    assert(htmlPreferred.headers.get("content-type").includes("text/html"));
    const head = await fetchOk(route, { method: "HEAD", headers: { Accept: "text/markdown" } });
    assert.equal(await head.text(), "");
    checks.push({
        path: route,
        metadata: "passed",
        structuredData: "passed",
        staticIndex: "passed",
        markdownNegotiation: "passed"
    });
}
assert.equal((await fetch(new URL("/markdown/unknown.md", base))).status, 404);
console.log("SEO integration checks passed for all public pages.");
await writeFile(
    path.join(directory, "seo-checks.json"),
    JSON.stringify(
        { measuredAt: new Date().toISOString(), target: base.href, authenticationCrawling: "allowed", checks },
        null,
        2
    ) + "\n"
);
if (mode === "--checks-only") process.exit(0);

// Invoke npm through Node rather than a shell; this also works on Windows.
const require = createRequire(import.meta.url);
let npmCli;
try {
    npmCli = require.resolve("npm/bin/npm-cli.js");
} catch {
    npmCli = path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js");
}
const scores = [];
for (const [index, route] of paths.entries()) {
    const prefix = path.join(directory, `seo-${index}`);
    const command = spawnSync(
        process.execPath,
        [
            npmCli,
            "exec",
            "--yes",
            "--package=lighthouse@13.5.0",
            "--",
            "lighthouse",
            new URL(route, base).href,
            "--only-categories=seo",
            "--chrome-flags=--headless",
            "--output=json",
            "--output=html",
            `--output-path=${prefix}`,
            "--quiet"
        ],
        { stdio: "inherit" }
    );
    if (command.error) throw command.error;
    assert.equal(command.status, 0, `Lighthouse ${route}`);
    const report = JSON.parse(await readFile(`${prefix}.report.json`, "utf8"));
    assert(!report.runtimeError, report.runtimeError?.message);
    const failures = report.categories.seo.auditRefs
        .map(({ id }) => report.audits[id])
        .filter((audit) => audit.score !== null && audit.score < 1)
        .map(({ id, title, description, details }) => ({ id, title, description, details }));
    const result = { path: route, score: Math.round(report.categories.seo.score * 100), failures };
    scores.push(result);
    console.log(result);
}
await writeFile(
    path.join(directory, "seo-summary.json"),
    JSON.stringify(
        { measuredAt: new Date().toISOString(), target: base.href, lighthouse: "13.5.0", checks, scores },
        null,
        2
    ) + "\n"
);
