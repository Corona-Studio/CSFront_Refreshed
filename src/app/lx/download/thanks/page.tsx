import { Component as Page } from "@/features/LauncherX/LxDownloadThanks";
import { Suspense } from "react";

export const metadata = { title: "安装指南" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
