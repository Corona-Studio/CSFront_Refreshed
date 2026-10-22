import { Suspense } from "react";

import StructuredData from "@/components/StructuredData";
import Page from "@/features/CMFS";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata("/cmfs");
export default function RoutePage() {
    return (
        <Suspense>
            <StructuredData path="/cmfs" />
            <Page />
        </Suspense>
    );
}
