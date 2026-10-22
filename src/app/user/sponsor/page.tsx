import { Suspense } from "react";

import { Component as Page } from "@/features/User/UserSponsor";

export const metadata = { title: "赞助支持" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
