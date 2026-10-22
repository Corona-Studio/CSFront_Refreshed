import { Suspense } from "react";

import Page from "@/features/Admin/AdminHome";

export const metadata = { title: "管理中心" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
