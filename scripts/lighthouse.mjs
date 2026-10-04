import { spawnSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// Run against `pnpm build && pnpm start`, never the development server.
const [target = "http://localhost:3000", label = "audit", count = "3", profile = "mobile"] = process.argv.slice(2);
const url = new URL(target);
const runs = Number(count);
if (!/^[a-z0-9_-]+$/i.test(label) || !Number.isInteger(runs) || runs < 1 || runs > 10) {
    throw new Error("Usage: pnpm perf:audit <url> <label> <runs:1-10> <mobile|desktop>");
}
if (!["mobile", "desktop"].includes(profile) || !["http:", "https:"].includes(url.protocol)) {
    throw new Error("Use an HTTP(S) URL and the mobile or desktop profile.");
}
const directory = path.resolve("reports/lighthouse");
await mkdir(directory, { recursive: true });
// Verify the production server is ready. Each run gets a cold browser cache.
const response = await fetch(url);
if (!response.ok) throw new Error(`Target returned HTTP ${response.status}`);
const results = [];
for (let run = 1; run <= runs; run++) {
    const prefix = path.join(directory, `${label}-${profile}-${run}`);
    const command = spawnSync(
        "npm",
        [
            "exec",
            "--yes",
            "--package=lighthouse@13.5.0",
            "--",
            "lighthouse",
            url.href,
            "--only-categories=performance",
            "--chrome-flags=--headless",
            "--output=json",
            "--output=html",
            `--output-path=${prefix}`,
            "--quiet",
            ...(profile === "desktop" ? ["--preset=desktop"] : [])
        ],
        { stdio: "inherit" }
    );
    if (command.error) throw command.error;
    if (command.status !== 0) throw new Error(`Lighthouse run ${run} failed (${command.status})`);
    const report = JSON.parse(await readFile(`${prefix}.report.json`, "utf8"));
    if (report.runtimeError) throw new Error(report.runtimeError.message);
    const audits = report.audits;
    results.push({
        score: Math.round(report.categories.performance.score * 100),
        fcpMs: audits["first-contentful-paint"].numericValue,
        lcpMs: audits["largest-contentful-paint"].numericValue,
        tbtMs: audits["total-blocking-time"].numericValue,
        cls: audits["cumulative-layout-shift"].numericValue,
        scriptBytes: audits["resource-summary"].details.items.find((item) => item.resourceType === "script")
            .transferSize,
        imageBytes: audits["resource-summary"].details.items.find((item) => item.resourceType === "image").transferSize
    });
    console.log(`Run ${run}/${runs}:`, results.at(-1));
}
const median = (values) => {
    const sorted = values.toSorted((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
};
const summary = {
    url: url.href,
    profile,
    lighthouse: "13.5.0",
    results,
    medians: Object.fromEntries(Object.keys(results[0]).map((key) => [key, median(results.map((run) => run[key]))]))
};
await writeFile(path.join(directory, `${label}-${profile}-summary.json`), JSON.stringify(summary, null, 2) + "\n");
console.log("Medians:", summary.medians);
