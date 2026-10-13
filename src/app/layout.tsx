import Footer from "@/components/Footer";
import MenuBar from "@/components/MenuBar";
import PageEntrance from "@/components/motion/page-entrance";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { SITE_URL, publicPages } from "@/lib/seo";

import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
    title: { default: "Corona Studio · 日冕工作室", template: "%s · Corona Studio" },
    description: publicPages[0].description,
    applicationName: "Corona Studio",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1
        }
    },
    icons: {
        icon: [
            { url: "/favicon.svg", type: "image/svg+xml" },
            { url: "/favicon.ico", type: "image/x-icon", sizes: "any" }
        ]
    }
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="zh-CN" data-scroll-behavior="smooth" suppressHydrationWarning>
            <body>
                <a
                    href="#main-content"
                    className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:p-3 focus:text-primary-foreground">
                    跳转到正文
                </a>
                <Providers>
                    <MenuBar />
                    <main id="main-content" className="min-h-[70vh]">
                        <PageEntrance>{children}</PageEntrance>
                    </main>
                    <Footer />
                    <Analytics />
                    <SpeedInsights />
                </Providers>
            </body>
        </html>
    );
}
