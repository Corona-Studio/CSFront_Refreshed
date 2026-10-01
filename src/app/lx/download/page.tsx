import { Component as Page } from "@/features/LauncherX/LxDownload";
import { Suspense } from "react";

export const metadata = { title: "下载 LauncherX" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
