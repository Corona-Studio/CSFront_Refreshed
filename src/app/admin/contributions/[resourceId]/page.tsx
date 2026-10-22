import { Suspense } from "react";

import { Component as Page } from "@/features/Admin/AdminContributionDetail";

export const metadata = { title: "贡献审核" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
