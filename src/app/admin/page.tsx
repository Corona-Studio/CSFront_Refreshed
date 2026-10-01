import Page from "@/features/Admin/AdminHome";
import { Suspense } from "react";

export const metadata = { title: "管理中心" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
