import { SITE_URL, publicPages } from "@/lib/seo";

export const dynamic = "force-static";
export function GET() {
    return new Response(
        `# Corona Studio · 日冕工作室\n\n> Minecraft 工具、开源项目与社区的官方网站。\n\n## 公开页面\n\n${publicPages.map((page) => `- [${page.title}](${SITE_URL}/markdown/${page.slug}.md): ${page.description}`).join("\n")}\n\n## 索引\n\n- [完整内容](${SITE_URL}/llms-full.txt)\n- [JSON 索引](${SITE_URL}/index.json)\n- [站点地图](${SITE_URL}/sitemap.xml)\n\n## 说明\n\n内容默认使用简体中文。浏览器语言切换不代表独立英文 URL。构建版本与下载地址请以官方下载页的实时数据为准。账号与管理页面不属于公开索引。\n`,
        { headers: { "Content-Type": "text/plain; charset=utf-8" } }
    );
}
