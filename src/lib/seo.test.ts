import { describe, expect, it } from "vitest";
import { pageMarkdown, pageMetadata, prefersMarkdown, publicPages, SITE_URL } from "./seo";
import { proxy } from "../proxy";
import { NextRequest } from "next/server";
import robots from "../app/robots";
import sitemap from "../app/sitemap";

describe("Markdown content negotiation", () => {
    it.each([
        [null, false],
        ["*/*", false],
        ["text/html, */*;q=0.8", false],
        ["text/markdown", true],
        ["TEXT/MARKDOWN; charset=utf-8", true],
        ["text/markdown;q=0", false],
        ["text/markdown;q=0.5,text/html", false],
        ["text/markdown,text/html;q=0.8", true],
        ["text/markdown;q=bogus", false],
        ["text/markdown;q=0.5,text/*;q=0.8", false],
        ["text/markdown;q=0.5,*/*;q=0.8", false]
    ])("negotiates %s", (accept, expected) => expect(prefersMarkdown(accept)).toBe(expected));

    it("serves Markdown without caching and preserves HEAD semantics", () => {
        const request = new NextRequest("https://corona.studio/lx", { headers: { accept: "text/markdown" } });
        const response = proxy(request);
        expect(response.headers.get("content-type")).toContain("text/markdown");
        expect(response.headers.get("vary")).toContain("Accept");
        expect(response.headers.get("cache-control")).toContain("no-store");
        expect(proxy(new NextRequest(request.url, { method: "HEAD", headers: request.headers })).body).toBeNull();
    });

    it.each(["rsc", "next-router-prefetch"])("preserves Next navigation with %s", (header) => {
        const response = proxy(
            new NextRequest("https://corona.studio/lx", { headers: { accept: "text/markdown", [header]: "1" } })
        );
        expect(response.headers.get("x-middleware-next")).toBe("1");
    });
    it("does not expose private or unknown paths", () => {
        expect(
            proxy(new NextRequest("https://corona.studio/user", { headers: { accept: "text/markdown" } })).headers.get(
                "x-middleware-next"
            )
        ).toBe("1");
    });
});

describe("public SEO content", () => {
    it("allows authentication crawling while excluding account and admin paths", () => {
        const rules = robots().rules;
        expect(Array.isArray(rules)).toBe(false);
        if (Array.isArray(rules)) throw new Error("Expected the shared crawler rule");
        expect(rules.disallow).toContain("/user");
        expect(rules.disallow).toContain("/admin");
        expect(rules.disallow).not.toContain("/auth");
    });
    it("lists only canonical public HTML pages in the sitemap", () => {
        expect(sitemap().map((entry) => entry.url)).toEqual(publicPages.map((page) => `${SITE_URL}${page.path}`));
    });
    it("keeps canonical, descriptions and Markdown sources aligned", () => {
        for (const page of publicPages) {
            const metadata = pageMetadata(page.path);
            expect(metadata.alternates?.canonical).toBe(`${SITE_URL}${page.path}`);
            expect(metadata.description).toBe(page.description);
            expect(pageMarkdown(page)).toContain(`来源：${SITE_URL}${page.path}`);
            expect(pageMarkdown(page)).not.toMatch(/\]\(\//);
        }
    });
});
