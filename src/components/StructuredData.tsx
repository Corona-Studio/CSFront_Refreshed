import { SITE_URL, publicPages } from "@/lib/seo";

export default function StructuredData({ path }: { path: (typeof publicPages)[number]["path"] }) {
    const page = publicPages.find((page) => page.path === path)!;
    const organization = { "@id": `${SITE_URL}/#organization` };
    const graph: Record<string, unknown>[] = [
        {
            "@type": "Organization",
            ...organization,
            name: "Corona Studio",
            alternateName: "日冕工作室",
            url: SITE_URL,
            logo: `${SITE_URL}/assets/logo.png`,
            sameAs: ["https://github.com/Corona-Studio"]
        },
        {
            "@type": "WebSite",
            "@id": `${SITE_URL}/#website`,
            name: "Corona Studio · 日冕工作室",
            url: SITE_URL,
            inLanguage: "zh-CN",
            publisher: organization
        },
        {
            "@type": path === "/cmfs" ? "CollectionPage" : "WebPage",
            "@id": `${SITE_URL}${path}#webpage`,
            url: `${SITE_URL}${path}`,
            name: page.title,
            description: page.description,
            inLanguage: "zh-CN",
            isPartOf: { "@id": `${SITE_URL}/#website` }
        }
    ];
    if (path !== "/") {
        const items = [{ name: "日冕工作室", item: `${SITE_URL}/` }];
        if (path === "/lx/download") items.push({ name: "LauncherX", item: `${SITE_URL}/lx` });
        items.push({ name: page.title, item: `${SITE_URL}${path}` });
        graph.push({
            "@type": "BreadcrumbList",
            itemListElement: items.map((item, index) => ({ "@type": "ListItem", position: index + 1, ...item }))
        });
    }
    if (path === "/lx")
        graph.push({
            "@type": "SoftwareApplication",
            "@id": `${SITE_URL}/lx#software`,
            name: "LauncherX",
            applicationCategory: "GameApplication",
            operatingSystem: "Windows, macOS, Linux",
            url: `${SITE_URL}/lx`,
            downloadUrl: `${SITE_URL}/lx/download`,
            description: page.description,
            image: `${SITE_URL}${page.image}`,
            publisher: organization
        });
    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c")
            }}
        />
    );
}
