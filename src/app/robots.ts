import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: { userAgent: "*", allow: "/", disallow: ["/auth/", "/user", "/admin", "/design-system"] },
        sitemap: "https://corona.studio/sitemap.xml"
    };
}
