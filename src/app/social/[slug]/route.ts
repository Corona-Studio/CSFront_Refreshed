import { ImageResponse } from "next/og";
import { publicPages } from "@/lib/seo";
import { socialImage } from "@/lib/social-image";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() {
    return publicPages.map((page) => ({ slug: `${page.slug}.png` }));
}
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const page = publicPages.find((page) => `${page.slug}.png` === slug);
    if (!page) return new Response("Not found", { status: 404 });
    return new ImageResponse(socialImage(page), { width: 1200, height: 630 });
}
