import Page from "@/features/LauncherX/LxHome";
import { Suspense } from "react";
import StructuredData from "@/components/StructuredData";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/lx");
export default function RoutePage() {
    return (
        <Suspense>
            <StructuredData path="/lx" />
            <Page />
        </Suspense>
    );
}
