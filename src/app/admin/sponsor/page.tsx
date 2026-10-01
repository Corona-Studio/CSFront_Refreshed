import { Component as Page } from "@/features/Admin/AdminSponsor";
import { Suspense } from "react";

export const metadata = { title: "赞助管理" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
