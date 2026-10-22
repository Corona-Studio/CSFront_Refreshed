import { Suspense } from "react";

import { Component as Page } from "@/features/Admin/AdminUsers";

export const metadata = { title: "用户管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
