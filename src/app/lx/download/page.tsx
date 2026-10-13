import { Component as Page } from "@/features/LauncherX/LxDownload";
import { Suspense } from "react";
import StructuredData from "@/components/StructuredData";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/lx/download");
export default function RoutePage() {
    return (
        <Suspense>
            <StructuredData path="/lx/download" />
            <Page />
        </Suspense>
    );
}
