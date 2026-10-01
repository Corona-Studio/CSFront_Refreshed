import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
    return ["/", "/lx", "/lx/download", "/cmfs"].map((path) => ({
        url: `https://corona.studio${path}`,
        changeFrequency: "weekly" as const,
        priority: path === "/" ? 1 : 0.8
    }));
}
