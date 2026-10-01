import { Component as Page } from "@/features/Admin/AdminNotifications";
import { Suspense } from "react";

export const metadata = { title: "通知管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
