import { Component as Page } from "@/features/User/UserSponsor";
import { Suspense } from "react";

export const metadata = { title: "赞助支持" };
export default function RoutePage() {
    return (
        <Suspense>
            <Page />
        </Suspense>
    );
}
