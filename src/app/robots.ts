import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            disallow: ["/user", "/admin", "/design-system", "/lx/download/thanks"]
        },
        sitemap: `${SITE_URL}/sitemap.xml`
    };
}
