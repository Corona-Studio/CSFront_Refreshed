import { Component as Page } from "@/features/Admin/AdminUsers";
import { Suspense } from "react";

export const metadata = { title: "用户管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
