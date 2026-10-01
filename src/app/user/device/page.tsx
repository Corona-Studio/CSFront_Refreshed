import { Component as Page } from "@/features/User/UserDeviceManagement";
import { Suspense } from "react";

export const metadata = { title: "设备管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
