import { Component as Page } from "@/features/Admin/AdminBuilds";
import { Suspense } from "react";

export const metadata = { title: "构建管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
