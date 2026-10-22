import { Suspense } from "react";

import { Component as Page } from "@/features/Admin/AdminNotifications";

export const metadata = { title: "通知管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
