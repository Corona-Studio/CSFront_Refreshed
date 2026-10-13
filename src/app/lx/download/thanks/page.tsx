import { Component as Page } from "@/features/LauncherX/LxDownloadThanks";
import { Suspense } from "react";
import { noIndex } from "@/lib/seo";

export const metadata = { title: "安装指南", ...noIndex };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
