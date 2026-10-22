import { Suspense } from "react";

import { Component as Page } from "@/features/User/UserDeviceManagement";

export const metadata = { title: "设备管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
