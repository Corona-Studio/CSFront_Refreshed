import Footer from "@/components/Footer";
import MenuBar from "@/components/MenuBar";
import PageEntrance from "@/components/motion/page-entrance";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { Suspense } from "react";

import "./globals.css";
import Providers from "./providers";

export const metadata: Metadata = {
    metadataBase: new URL("https://corona.studio"),
    title: { default: "Corona Studio · 日冕工作室", template: "%s · Corona Studio" },
    description: "由 Minecraft 爱好者组建的开发团队。探索 LauncherX、ProjBobcat、ConnectX 与 CMFS。",
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
                        <PageEntrance>
                            <Suspense
                                fallback={
                                    <div className="m-container py-20 m-kicker" role="status">
                                        LOADING / 正在加载…
                                    </div>
                                }>
                                {children}
                            </Suspense>
                        </PageEntrance>
                    </main>
                    <Footer />
                    <Analytics />
                    <SpeedInsights />
                </Providers>
            </body>
        </html>
    );
}
