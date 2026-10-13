import type { MetadataRoute } from "next";
import { SITE_URL, publicPages } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
    return publicPages.map((page) => ({
        url: `${SITE_URL}${page.path}`,
        images: [`${SITE_URL}${page.image}`],
        changeFrequency: page.path === "/lx/download" ? "weekly" : "monthly",
        priority: page.path === "/" ? 1 : 0.8
    }));
}
