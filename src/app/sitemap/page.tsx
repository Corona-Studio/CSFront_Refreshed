import Link from "next/link";
import { SITE_URL, publicPages } from "@/lib/seo";

export const metadata = {
    title: "站点导航",
    description: "日冕工作室的公开页面、下载中心与机器可读索引。",
    alternates: { canonical: `${SITE_URL}/sitemap` },
    robots: { index: false, follow: true }
};

export default function SitemapPage() {
    return (
        <section className="m-section">
            <div className="m-container">
                <h1>站点导航</h1>
                <ul className="mt-8 space-y-6">
                    {publicPages.map((page) => (
                        <li key={page.path}>
                            <Link className="text-xl font-bold underline" href={page.path}>
                                {page.title}
                            </Link>
                            <p className="mt-2 text-muted-foreground">{page.description}</p>
                        </li>
                    ))}
                </ul>
                <h2 className="mt-12">机器可读索引</h2>
                <ul className="mt-6 space-y-3">
                    <li>
                        <a href="/sitemap.xml">XML 站点地图</a>
                    </li>
                    <li>
                        <a href="/llms.txt">LLMs 索引</a>
                    </li>
                    <li>
                        <a href="/llms-full.txt">完整 Markdown 内容</a>
                    </li>
                    <li>
                        <a href="/index.json">JSON 静态索引</a>
                    </li>
                </ul>
            </div>
        </section>
    );
}
