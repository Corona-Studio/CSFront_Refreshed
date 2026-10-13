import { pageMarkdown, publicPages } from "@/lib/seo";

export const dynamic = "force-static";
export function GET() {
    return new Response(publicPages.map(pageMarkdown).join("\n---\n\n"), {
        headers: { "Content-Type": "text/plain; charset=utf-8" }
    });
}
