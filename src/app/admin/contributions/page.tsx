import { Component as Page } from "@/features/Admin/AdminContributions";
import { Suspense } from "react";

export const metadata = { title: "贡献管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
