import { NextResponse, type NextRequest } from "next/server";
import { SITE_URL, pageMarkdown, prefersMarkdown, publicPages } from "@/lib/seo";

export function proxy(request: NextRequest) {
    const page = publicPages.find((page) => page.path === request.nextUrl.pathname);
    if (!page) return NextResponse.next();
    const markdown = prefersMarkdown(request.headers.get("accept"));
    // Never replace Next.js navigation/prefetch payloads with Markdown.
    if (
        (request.method === "GET" || request.method === "HEAD") &&
        markdown &&
        !request.headers.has("rsc") &&
        !request.headers.has("next-router-prefetch")
    ) {
        return new NextResponse(request.method === "HEAD" ? null : pageMarkdown(page), {
            headers: {
                "Content-Type": "text/markdown; charset=utf-8",
                Vary: "Accept, RSC, Next-Router-Prefetch",
                "Cache-Control": "private, no-store",
                "X-Content-Type-Options": "nosniff",
                Link: `<${SITE_URL}${page.path}>; rel="canonical"`
            }
        });
    }
    const response = NextResponse.next();
    response.headers.set(
        "Vary",
        "Accept, RSC, Next-Router-State-Tree, Next-Router-Prefetch, Next-Router-Segment-Prefetch"
    );
    response.headers.set("Link", `<${SITE_URL}/markdown/${page.slug}.md>; rel="alternate"; type="text/markdown"`);
    return response;
}

export const config = { matcher: ["/", "/lx", "/lx/download", "/cmfs"] };
