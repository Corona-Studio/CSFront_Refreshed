import { Suspense } from "react";

import { Component as Page } from "@/features/Admin/AdminBuilds";

export const metadata = { title: "构建管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
