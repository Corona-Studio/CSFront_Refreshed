import { Suspense } from "react";

import Page from "@/features/User/UserHome";

export const metadata = { title: "用户中心" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
