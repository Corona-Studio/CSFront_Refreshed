import { SITE_URL, pageMarkdown, publicPages } from "@/lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
    return publicPages.map((page) => ({ slug: `${page.slug}.md` }));
}
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = publicPages.find((page) => `${page.slug}.md` === slug);
    if (!page) return new Response("Not found", { status: 404 });
    return new Response(pageMarkdown(page), {
        headers: {
            "Content-Type": "text/markdown; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
            "X-Robots-Tag": "noindex",
            Link: `<${SITE_URL}${page.path}>; rel="canonical"`
        }
    });
}
