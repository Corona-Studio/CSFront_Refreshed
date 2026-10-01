import { Component as Page } from "@/features/Admin/AdminContributionDetail";
import { Suspense } from "react";

export const metadata = { title: "贡献审核" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
