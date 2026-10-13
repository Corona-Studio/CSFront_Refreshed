import { SITE_URL, pageMarkdown, publicPages } from "@/lib/seo";

export const dynamic = "force-static";
export function GET() {
    return Response.json({
        name: "Corona Studio · 日冕工作室",
        url: SITE_URL,
        language: "zh-CN",
        pages: publicPages.map((page) => ({
            url: `${SITE_URL}${page.path}`,
            title: page.title,
            description: page.description,
            markdown: `${SITE_URL}/markdown/${page.slug}.md`,
            content: pageMarkdown(page)
        }))
    });
}
